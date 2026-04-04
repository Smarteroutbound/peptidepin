import { z } from "zod";

// ─── Vials ───────────────────────────────────────────────

export const addVialSchema = z.object({
  peptide_id: z.string().uuid("Select a peptide"),
  custom_label: z.string().max(100).optional(),
  vial_size_mcg: z.number({ error: "Vial size is required" }).positive("Must be greater than 0"),
  bac_water_ml: z.number({ error: "BAC water is required" }).positive("Must be greater than 0"),
  dose_per_injection_mcg: z.number().positive("Must be greater than 0").optional(),
  notes: z.string().max(500).optional(),
  date_reconstituted: z.string().optional(),
});

export const updateVialSchema = z.object({
  custom_label: z.string().max(100).optional(),
  remaining_mcg: z.number().min(0, "Cannot be negative").optional(),
  dose_per_injection_mcg: z.number().positive("Must be greater than 0").optional(),
  notes: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
});

export type AddVialInput = z.infer<typeof addVialSchema>;
export type UpdateVialInput = z.infer<typeof updateVialSchema>;

// ─── Schedules ───────────────────────────────────────────

export const createScheduleSchema = z.object({
  user_peptide_id: z.string().uuid("Select a vial"),
  dose_mcg: z.number({ error: "Dose is required" }).positive("Must be greater than 0"),
  frequency: z.enum([
    "once_daily",
    "twice_daily",
    "three_daily",
    "every_other_day",
    "weekly",
    "biweekly",
    "monthly",
    "custom",
  ]),
  times_of_day: z.array(z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format")).min(1, "At least one time required"),
  days_of_week: z.array(z.number().min(0).max(6)).optional(),
  is_active: z.boolean().default(true),
});

export const updateScheduleSchema = z.object({
  dose_mcg: z.number().positive("Must be greater than 0").optional(),
  frequency: z.enum([
    "once_daily",
    "twice_daily",
    "three_daily",
    "every_other_day",
    "weekly",
    "biweekly",
    "monthly",
    "custom",
  ]).optional(),
  times_of_day: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1).optional(),
  days_of_week: z.array(z.number().min(0).max(6)).optional(),
  is_active: z.boolean().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

// ─── Dose Logs ───────────────────────────────────────────

export const logDoseSchema = z.object({
  user_peptide_id: z.string().uuid(),
  schedule_id: z.string().uuid().optional(),
  dose_mcg: z.number({ error: "Dose is required" }).positive("Must be greater than 0"),
  volume_ml: z.number().positive().optional(),
  scheduled_at: z.string().optional(),
  status: z.enum(["taken", "skipped", "missed"]).default("taken"),
  notes: z.string().max(500).optional(),
});

export const updateLogSchema = z.object({
  status: z.enum(["taken", "skipped", "missed"]).optional(),
  dose_mcg: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
  volume_ml: z.number().positive().optional(),
});

export type LogDoseInput = z.infer<typeof logDoseSchema>;
export type UpdateLogInput = z.infer<typeof updateLogSchema>;

// ─── Profile ─────────────────────────────────────────────

export const updateProfileSchema = z.object({
  display_name: z.string().min(1, "Name is required").max(100).optional(),
  unit_preference: z.enum(["mcg", "mg", "iu"]).optional(),
  timezone: z.string().optional(),
  notifications_enabled: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
