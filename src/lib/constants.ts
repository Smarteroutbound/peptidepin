export const APP_NAME = "PeptidePin";
export const APP_DESCRIPTION =
  "Calculate, track, and never miss a peptide dose";
export const APP_URL = "https://peptidepin.com";

export const FREQUENCIES = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_daily", label: "Three times daily" },
  { value: "every_other_day", label: "Every other day" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
] as const;

export const PEPTIDE_CATEGORIES = [
  "healing",
  "growth",
  "cognitive",
  "weight-loss",
  "anti-aging",
  "immune",
  "sleep",
  "sexual-health",
  "other",
] as const;

export const COMMON_VIAL_SIZES_MCG = [
  2000, 5000, 10000, 15000, 20000, 30000, 50000,
] as const;

export const COMMON_BAC_WATER_ML = [1, 1.5, 2, 2.5, 3, 5] as const;

export const SYRINGE_TYPES = [
  { value: 0.3, label: "0.3ml (30 units)" },
  { value: 0.5, label: "0.5ml (50 units)" },
  { value: 1.0, label: "1ml (100 units)" },
] as const;
