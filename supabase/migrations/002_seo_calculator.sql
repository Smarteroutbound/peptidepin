-- PeptidePin Migration 002: SEO Calculator Support
-- Adds: peptide_variants, peptide_titration_steps, SEO columns on peptides, public RLS

-- ============================================================
-- PEPTIDE VARIANTS (size options per peptide)
-- ============================================================
CREATE TABLE public.peptide_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peptide_id UUID NOT NULL REFERENCES public.peptides(id) ON DELETE CASCADE,
  size_mcg NUMERIC NOT NULL,
  size_label TEXT NOT NULL,              -- "5mg", "10mg", "5000 IU"
  common_bac_water_ml NUMERIC DEFAULT 2.0,
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_peptide_variants_peptide ON public.peptide_variants(peptide_id);

-- ============================================================
-- PEPTIDE TITRATION STEPS (for GLP-1 dose escalation)
-- ============================================================
CREATE TABLE public.peptide_titration_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peptide_id UUID NOT NULL REFERENCES public.peptides(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  dose_mcg NUMERIC NOT NULL,
  duration_weeks INT NOT NULL,
  label TEXT,                            -- "Month 1", "Maintenance"
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(peptide_id, step_number)
);

CREATE INDEX idx_titration_steps_peptide ON public.peptide_titration_steps(peptide_id);

-- ============================================================
-- ADD SEO + UNIT COLUMNS TO PEPTIDES
-- ============================================================
ALTER TABLE public.peptides ADD COLUMN IF NOT EXISTS unit_type TEXT NOT NULL DEFAULT 'mcg'
  CHECK (unit_type IN ('mcg', 'mg', 'iu'));
ALTER TABLE public.peptides ADD COLUMN IF NOT EXISTS delivery_forms TEXT[] DEFAULT '{injectable}';
ALTER TABLE public.peptides ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.peptides ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.peptides ADD COLUMN IF NOT EXISTS faq JSONB;
ALTER TABLE public.peptides ADD COLUMN IF NOT EXISTS how_to_calculate TEXT;

-- ============================================================
-- RLS: OPEN PEPTIDES + VARIANTS + TITRATION FOR PUBLIC READ
-- ============================================================
-- Drop existing authenticated-only policy on peptides
DROP POLICY IF EXISTS "Authenticated users read peptides" ON public.peptides;

-- Create public read policy (anonymous + authenticated)
CREATE POLICY "Anyone can read published peptides"
  ON public.peptides FOR SELECT
  USING (is_published = true);

-- Variants: enable RLS + public read
ALTER TABLE public.peptide_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read peptide variants"
  ON public.peptide_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.peptides p
      WHERE p.id = peptide_id AND p.is_published = true
    )
  );

-- Titration steps: enable RLS + public read
ALTER TABLE public.peptide_titration_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read titration steps"
  ON public.peptide_titration_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.peptides p
      WHERE p.id = peptide_id AND p.is_published = true
    )
  );
