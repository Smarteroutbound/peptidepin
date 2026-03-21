-- PeptidePin Database Schema
-- Run this in the Supabase SQL editor or via `supabase db push`

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  unit_preference TEXT NOT NULL DEFAULT 'mcg'
    CHECK (unit_preference IN ('mcg', 'mg', 'iu')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  push_subscription JSONB,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PEPTIDES CATALOG (admin-managed reference data)
-- ============================================================
CREATE TABLE public.peptides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  typical_vial_size_mcg NUMERIC NOT NULL,
  recommended_dose_mcg_min NUMERIC,
  recommended_dose_mcg_max NUMERIC,
  recommended_frequency TEXT,
  reconstitution_notes TEXT,
  half_life_hours NUMERIC,
  common_bac_water_ml NUMERIC DEFAULT 2.0,
  storage_instructions TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER PEPTIDE INVENTORY
-- ============================================================
CREATE TABLE public.user_peptides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  peptide_id UUID NOT NULL REFERENCES public.peptides(id),
  custom_label TEXT,
  vial_size_mcg NUMERIC NOT NULL,
  bac_water_ml NUMERIC NOT NULL,
  concentration_mcg_per_ml NUMERIC GENERATED ALWAYS AS
    (vial_size_mcg / NULLIF(bac_water_ml, 0)) STORED,
  dose_per_injection_mcg NUMERIC,
  dose_volume_ml NUMERIC GENERATED ALWAYS AS
    (dose_per_injection_mcg / NULLIF(vial_size_mcg / NULLIF(bac_water_ml, 0), 0)) STORED,
  remaining_mcg NUMERIC,
  date_reconstituted DATE,
  expiry_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_peptides_user ON public.user_peptides(user_id);

-- ============================================================
-- DOSE SCHEDULES
-- ============================================================
CREATE TABLE public.dose_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_peptide_id UUID NOT NULL REFERENCES public.user_peptides(id) ON DELETE CASCADE,
  dose_mcg NUMERIC NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN (
    'once_daily', 'twice_daily', 'three_daily',
    'every_other_day', 'weekly', 'custom'
  )),
  times_of_day TIME[] NOT NULL,
  days_of_week INT[],
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dose_schedules_user ON public.dose_schedules(user_id);

-- ============================================================
-- DOSE LOGS
-- ============================================================
CREATE TABLE public.dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_peptide_id UUID NOT NULL REFERENCES public.user_peptides(id),
  schedule_id UUID REFERENCES public.dose_schedules(id),
  dose_mcg NUMERIC NOT NULL,
  volume_ml NUMERIC,
  scheduled_at TIMESTAMPTZ,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'taken'
    CHECK (status IN ('taken', 'skipped', 'missed')),
  notes TEXT,
  logged_offline BOOLEAN NOT NULL DEFAULT false,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dose_logs_user_date ON public.dose_logs(user_id, taken_at DESC);

-- ============================================================
-- MIXING CALCULATIONS
-- ============================================================
CREATE TABLE public.mixing_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  peptide_id UUID REFERENCES public.peptides(id),
  vial_size_mcg NUMERIC NOT NULL,
  bac_water_ml NUMERIC NOT NULL,
  desired_dose_mcg NUMERIC NOT NULL,
  concentration_mcg_per_ml NUMERIC NOT NULL,
  injection_volume_ml NUMERIC NOT NULL,
  syringe_units NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peptides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_peptides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mixing_calculations ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Peptides catalog (read-only for authenticated)
CREATE POLICY "Authenticated users read peptides"
  ON public.peptides FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = true);

-- User peptides
CREATE POLICY "Users manage own peptides"
  ON public.user_peptides FOR ALL USING (auth.uid() = user_id);

-- Dose schedules
CREATE POLICY "Users manage own schedules"
  ON public.dose_schedules FOR ALL USING (auth.uid() = user_id);

-- Dose logs
CREATE POLICY "Users manage own dose logs"
  ON public.dose_logs FOR ALL USING (auth.uid() = user_id);

-- Mixing calculations
CREATE POLICY "Users manage own calculations"
  ON public.mixing_calculations FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: deduct remaining peptide on dose log
-- ============================================================
CREATE OR REPLACE FUNCTION public.deduct_dose()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'taken' THEN
    UPDATE public.user_peptides
    SET remaining_mcg = GREATEST(0, COALESCE(remaining_mcg, 0) - NEW.dose_mcg),
        updated_at = now()
    WHERE id = NEW.user_peptide_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_dose_logged
  AFTER INSERT ON public.dose_logs
  FOR EACH ROW EXECUTE FUNCTION public.deduct_dose();
