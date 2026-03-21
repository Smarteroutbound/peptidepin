// Supabase generated types - will be replaced by `supabase gen types`
// For now, manual types matching our schema

export interface PeptideFAQ {
  q: string;
  a: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          unit_preference: "mcg" | "mg" | "iu";
          notifications_enabled: boolean;
          push_subscription: Json | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          unit_preference?: "mcg" | "mg" | "iu";
          notifications_enabled?: boolean;
          push_subscription?: Json | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          unit_preference?: "mcg" | "mg" | "iu";
          notifications_enabled?: boolean;
          push_subscription?: Json | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      peptides: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string | null;
          typical_vial_size_mcg: number;
          recommended_dose_mcg_min: number | null;
          recommended_dose_mcg_max: number | null;
          recommended_frequency: string | null;
          reconstitution_notes: string | null;
          half_life_hours: number | null;
          common_bac_water_ml: number;
          storage_instructions: string | null;
          is_published: boolean;
          unit_type: "mcg" | "mg" | "iu";
          delivery_forms: string[];
          seo_title: string | null;
          seo_description: string | null;
          faq: PeptideFAQ[] | null;
          how_to_calculate: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category?: string | null;
          typical_vial_size_mcg: number;
          recommended_dose_mcg_min?: number | null;
          recommended_dose_mcg_max?: number | null;
          recommended_frequency?: string | null;
          reconstitution_notes?: string | null;
          half_life_hours?: number | null;
          common_bac_water_ml?: number;
          storage_instructions?: string | null;
          is_published?: boolean;
          unit_type?: "mcg" | "mg" | "iu";
          delivery_forms?: string[];
          seo_title?: string | null;
          seo_description?: string | null;
          faq?: PeptideFAQ[] | null;
          how_to_calculate?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          category?: string | null;
          typical_vial_size_mcg?: number;
          recommended_dose_mcg_min?: number | null;
          recommended_dose_mcg_max?: number | null;
          recommended_frequency?: string | null;
          reconstitution_notes?: string | null;
          half_life_hours?: number | null;
          common_bac_water_ml?: number;
          storage_instructions?: string | null;
          is_published?: boolean;
          unit_type?: "mcg" | "mg" | "iu";
          seo_title?: string | null;
          seo_description?: string | null;
          faq?: PeptideFAQ[] | null;
          how_to_calculate?: string | null;
        };
      };
      peptide_variants: {
        Row: {
          id: string;
          peptide_id: string;
          size_mcg: number;
          size_label: string;
          common_bac_water_ml: number;
          is_default: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          peptide_id: string;
          size_mcg: number;
          size_label: string;
          common_bac_water_ml?: number;
          is_default?: boolean;
          sort_order?: number;
        };
        Update: {
          size_mcg?: number;
          size_label?: string;
          common_bac_water_ml?: number;
          is_default?: boolean;
          sort_order?: number;
        };
      };
      peptide_titration_steps: {
        Row: {
          id: string;
          peptide_id: string;
          step_number: number;
          dose_mcg: number;
          duration_weeks: number;
          label: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          peptide_id: string;
          step_number: number;
          dose_mcg: number;
          duration_weeks: number;
          label?: string | null;
          notes?: string | null;
        };
        Update: {
          step_number?: number;
          dose_mcg?: number;
          duration_weeks?: number;
          label?: string | null;
          notes?: string | null;
        };
      };
      user_peptides: {
        Row: {
          id: string;
          user_id: string;
          peptide_id: string;
          custom_label: string | null;
          vial_size_mcg: number;
          bac_water_ml: number;
          concentration_mcg_per_ml: number | null;
          dose_per_injection_mcg: number | null;
          dose_volume_ml: number | null;
          remaining_mcg: number | null;
          date_reconstituted: string | null;
          expiry_date: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          peptide_id: string;
          custom_label?: string | null;
          vial_size_mcg: number;
          bac_water_ml: number;
          dose_per_injection_mcg?: number | null;
          remaining_mcg?: number | null;
          date_reconstituted?: string | null;
          expiry_date?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
        Update: {
          custom_label?: string | null;
          vial_size_mcg?: number;
          bac_water_ml?: number;
          dose_per_injection_mcg?: number | null;
          remaining_mcg?: number | null;
          date_reconstituted?: string | null;
          expiry_date?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
      };
      dose_schedules: {
        Row: {
          id: string;
          user_id: string;
          user_peptide_id: string;
          dose_mcg: number;
          frequency: string;
          times_of_day: string[];
          days_of_week: number[] | null;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_peptide_id: string;
          dose_mcg: number;
          frequency: string;
          times_of_day: string[];
          days_of_week?: number[] | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
        };
        Update: {
          dose_mcg?: number;
          frequency?: string;
          times_of_day?: string[];
          days_of_week?: number[] | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
        };
      };
      dose_logs: {
        Row: {
          id: string;
          user_id: string;
          user_peptide_id: string;
          schedule_id: string | null;
          dose_mcg: number;
          volume_ml: number | null;
          scheduled_at: string | null;
          taken_at: string;
          status: "taken" | "skipped" | "missed";
          notes: string | null;
          logged_offline: boolean;
          synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_peptide_id: string;
          schedule_id?: string | null;
          dose_mcg: number;
          volume_ml?: number | null;
          scheduled_at?: string | null;
          taken_at?: string;
          status?: "taken" | "skipped" | "missed";
          notes?: string | null;
          logged_offline?: boolean;
          synced_at?: string | null;
        };
        Update: {
          dose_mcg?: number;
          volume_ml?: number | null;
          status?: "taken" | "skipped" | "missed";
          notes?: string | null;
          synced_at?: string | null;
        };
      };
      mixing_calculations: {
        Row: {
          id: string;
          user_id: string;
          peptide_id: string | null;
          vial_size_mcg: number;
          bac_water_ml: number;
          desired_dose_mcg: number;
          concentration_mcg_per_ml: number;
          injection_volume_ml: number;
          syringe_units: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          peptide_id?: string | null;
          vial_size_mcg: number;
          bac_water_ml: number;
          desired_dose_mcg: number;
          concentration_mcg_per_ml: number;
          injection_volume_ml: number;
          syringe_units?: number | null;
        };
        Update: {};
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience type aliases
export type Peptide = Database["public"]["Tables"]["peptides"]["Row"];
export type PeptideVariant = Database["public"]["Tables"]["peptide_variants"]["Row"];
export type TitrationStep = Database["public"]["Tables"]["peptide_titration_steps"]["Row"];
export type UserPeptide = Database["public"]["Tables"]["user_peptides"]["Row"];
export type DoseSchedule = Database["public"]["Tables"]["dose_schedules"]["Row"];
export type DoseLog = Database["public"]["Tables"]["dose_logs"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Enriched types for UI
export interface PeptideWithVariants extends Peptide {
  variants: PeptideVariant[];
  titration_steps: TitrationStep[];
}

export type SyringeType = "0.3ml" | "0.5ml" | "1.0ml";

export interface CalculationResult {
  concentrationMcgPerMl: number;
  injectionVolumeMl: number;
  syringeUnits: number;
  dosesPerVial: number;
  daysSupply: number;
  costPerDose: number | null;
  suggestedSyringe: SyringeType;
  nearestTick: number;
  unitLabel: string; // "mcg", "mg", or "IU"
}
