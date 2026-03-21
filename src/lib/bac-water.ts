/**
 * BAC water recommendation engine.
 * Suggests optimal reconstitution volumes based on peptide size and typical dose.
 */

export interface BacAlternative {
  bacMl: number;
  concentrationMgPerMl: number;
  doseUnits: number;
  pros: string;
  isRecommended: boolean;
}

export interface BacRecommendation {
  recommendedMl: number;
  reasoning: string;
  alternatives: BacAlternative[];
}

const COMMON_BAC_AMOUNTS = [1, 1.5, 2, 2.5, 3, 5] as const;

/**
 * Recommend optimal BAC water amount for reconstitution.
 *
 * @param peptideMg - Total peptide in the vial (mg)
 * @param typicalDoseMcg - A representative dose in mcg
 * @param bacVialMl - User's BAC water vial size (optional, for leftover calc)
 */
export function recommendBacWater(
  peptideMg: number,
  typicalDoseMcg: number,
  bacVialMl?: number
): BacRecommendation {
  if (peptideMg <= 0 || typicalDoseMcg <= 0) {
    return {
      recommendedMl: 2,
      reasoning: "Default recommendation: 2 mL works well for most peptides.",
      alternatives: [],
    };
  }

  const alternatives: BacAlternative[] = COMMON_BAC_AMOUNTS.map((bacMl) => {
    const concentrationMgPerMl = peptideMg / bacMl;
    // dose in syringe units: (doseMcg / concentrationMcgPerMl) * 100
    const concentrationMcgPerMl = concentrationMgPerMl * 1000;
    const doseUnits = (typicalDoseMcg / concentrationMcgPerMl) * 100;

    // Determine pros
    const pros: string[] = [];
    if (doseUnits <= 8) pros.push("Tiny injections");
    if (doseUnits >= 5 && doseUnits <= 20) pros.push("Easy to measure");
    if (isRoundConcentration(concentrationMgPerMl))
      pros.push("Easy math - round numbers");
    if (doseUnits >= 10 && doseUnits <= 15)
      pros.push("More precise for small doses");
    if (doseUnits > 20 && doseUnits <= 30) pros.push("Good precision");

    // Recommended if dose units are in the sweet spot and concentration is clean
    const isRecommended =
      doseUnits >= 5 &&
      doseUnits <= 20 &&
      (isRoundConcentration(concentrationMgPerMl) || doseUnits >= 8);

    return {
      bacMl,
      concentrationMgPerMl,
      doseUnits: Math.round(doseUnits * 100) / 100,
      pros: pros.join(", ") || "Usable",
      isRecommended,
    };
  });

  // Pick the best recommendation
  let recommended = alternatives.find((a) => a.isRecommended);

  // Apply peptide-specific preferences if no clear winner
  if (!recommended) {
    // For large vials (e.g. tirz 30mg), prefer 3mL
    if (peptideMg >= 20) {
      recommended = alternatives.find((a) => a.bacMl === 3);
    }
    // For 5mg vials with low doses (sema-like), prefer 1mL
    else if (peptideMg <= 5 && typicalDoseMcg <= 500) {
      recommended = alternatives.find((a) => a.bacMl === 1);
    }
    // Default to 2mL
    else {
      recommended = alternatives.find((a) => a.bacMl === 2);
    }
  }

  // Fallback
  if (!recommended) {
    recommended = alternatives[2]; // 2mL
  }

  // Sort: recommended first, then ascending by bacMl
  const sorted = [...alternatives].sort((a, b) => {
    if (a.bacMl === recommended!.bacMl) return -1;
    if (b.bacMl === recommended!.bacMl) return 1;
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    return a.bacMl - b.bacMl;
  });

  // Build reasoning
  const reasoning = buildReasoning(
    recommended.bacMl,
    recommended.doseUnits,
    recommended.concentrationMgPerMl,
    peptideMg
  );

  return {
    recommendedMl: recommended.bacMl,
    reasoning,
    alternatives: sorted,
  };
}

function isRoundConcentration(mgPerMl: number): boolean {
  // Check if the concentration produces round-ish numbers
  // e.g. 2.5, 5, 10, 1, 0.5
  const nice = [0.25, 0.5, 1, 1.25, 2, 2.5, 3, 4, 5, 6, 10, 15, 20];
  return nice.some((n) => Math.abs(mgPerMl - n) < 0.01);
}

function buildReasoning(
  bacMl: number,
  doseUnits: number,
  concMgPerMl: number,
  peptideMg: number
): string {
  const parts: string[] = [];

  parts.push(
    `Adding ${bacMl} mL to your ${peptideMg} mg vial gives a concentration of ${formatConc(concMgPerMl)} mg/mL.`
  );

  if (doseUnits >= 5 && doseUnits <= 15) {
    parts.push(
      `Your dose will be about ${Math.round(doseUnits)} units on a syringe, which is easy to read and measure accurately.`
    );
  } else if (doseUnits < 5) {
    parts.push(
      `Your dose will be only ${Math.round(doseUnits)} units, so you may want more BAC water for easier measurement.`
    );
  } else {
    parts.push(
      `Your dose will be about ${Math.round(doseUnits)} units on a syringe.`
    );
  }

  return parts.join(" ");
}

function formatConc(n: number): string {
  return parseFloat(n.toFixed(2)).toString();
}
