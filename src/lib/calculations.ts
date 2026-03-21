/**
 * Pure calculation functions for peptide reconstitution and dosing.
 * All units are in mcg and ml unless otherwise noted.
 */

/** Calculate concentration after reconstitution */
export function calculateConcentration(
  vialSizeMcg: number,
  bacWaterMl: number
): number {
  if (bacWaterMl <= 0) return 0;
  return vialSizeMcg / bacWaterMl;
}

/** Calculate injection volume in ml for a desired dose */
export function calculateInjectionVolume(
  desiredDoseMcg: number,
  concentrationMcgPerMl: number
): number {
  if (concentrationMcgPerMl <= 0) return 0;
  return desiredDoseMcg / concentrationMcgPerMl;
}

/** Convert ml to insulin syringe units (U-100: 1 unit = 0.01ml) */
export function mlToSyringeUnits(ml: number): number {
  return ml * 100;
}

/** Convert syringe units to ml */
export function syringeUnitsToMl(units: number): number {
  return units / 100;
}

/** Convert mcg to mg */
export function mcgToMg(mcg: number): number {
  return mcg / 1000;
}

/** Convert mg to mcg */
export function mgToMcg(mg: number): number {
  return mg * 1000;
}

/** Calculate number of doses remaining in a vial */
export function calculateDosesRemaining(
  remainingMcg: number,
  dosePerInjectionMcg: number
): number {
  if (dosePerInjectionMcg <= 0) return 0;
  return Math.floor(remainingMcg / dosePerInjectionMcg);
}

/** Calculate days supply remaining */
export function calculateDaysSupply(
  remainingMcg: number,
  dosePerInjectionMcg: number,
  dosesPerDay: number
): number {
  if (dosePerInjectionMcg <= 0 || dosesPerDay <= 0) return 0;
  const totalDoses = remainingMcg / dosePerInjectionMcg;
  return Math.floor(totalDoses / dosesPerDay);
}

/** Full calculation result from vial + BAC water + desired dose */
export interface MixingResult {
  concentrationMcgPerMl: number;
  injectionVolumeMl: number;
  syringeUnits: number;
  dosesPerVial: number;
}

export function calculateMixing(
  vialSizeMcg: number,
  bacWaterMl: number,
  desiredDoseMcg: number
): MixingResult {
  const concentrationMcgPerMl = calculateConcentration(vialSizeMcg, bacWaterMl);
  const injectionVolumeMl = calculateInjectionVolume(
    desiredDoseMcg,
    concentrationMcgPerMl
  );
  const syringeUnits = mlToSyringeUnits(injectionVolumeMl);
  const dosesPerVial = calculateDosesRemaining(vialSizeMcg, desiredDoseMcg);

  return {
    concentrationMcgPerMl,
    injectionVolumeMl,
    syringeUnits,
    dosesPerVial,
  };
}

/** Format number to fixed decimal places, removing trailing zeros */
export function formatNumber(value: number, decimals: number = 2): string {
  return parseFloat(value.toFixed(decimals)).toString();
}

/** Format mcg display with unit */
export function formatDose(mcg: number, unit: "mcg" | "mg" | "iu" = "mcg"): string {
  switch (unit) {
    case "mg":
      return `${formatNumber(mcgToMg(mcg))} mg`;
    case "iu":
      return `${formatNumber(mcg)} IU`;
    default:
      return `${formatNumber(mcg)} mcg`;
  }
}
