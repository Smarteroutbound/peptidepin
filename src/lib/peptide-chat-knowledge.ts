/**
 * Local peptide knowledge base for chat fallback.
 *
 * Used when OPENROUTER_API_KEY is missing or the AI call fails.
 * Provides basic keyword-matched answers so the chat always "works".
 *
 * Inspired by mileschildress88/Peptide-Calculator/src/lib/peptide-knowledge.ts
 */

export interface PeptideKnowledge {
  slug: string;
  displayName: string;
  aliases: string[];
  category: string;
  description: string;
  typicalDose: string;
  frequency: string;
  halfLife: string;
  storage: string;
  commonSideEffects: string[];
  fastedOrFed?: string;
}

export const PEPTIDE_KNOWLEDGE: PeptideKnowledge[] = [
  {
    slug: "bpc-157",
    displayName: "BPC-157",
    aliases: ["bpc157", "bpc", "body protection compound"],
    category: "healing",
    description:
      "A gastric peptide studied for tissue healing, gut health, and injury recovery.",
    typicalDose: "250–500 mcg",
    frequency: "1–2x daily",
    halfLife: "~4 hours",
    storage: "Refrigerate after reconstitution. Use within 28 days.",
    commonSideEffects: ["Mild injection site reactions", "Occasional fatigue"],
  },
  {
    slug: "tb-500",
    displayName: "TB-500",
    aliases: ["tb500", "thymosin beta-4", "thymosin"],
    category: "healing",
    description:
      "A synthetic fragment of thymosin beta-4, used for soft tissue recovery.",
    typicalDose: "2–5 mg",
    frequency: "2x weekly loading, then weekly maintenance",
    halfLife: "~2 hours",
    storage: "Refrigerate after reconstitution. Use within 28 days.",
    commonSideEffects: ["Mild fatigue after injection", "Injection site reactions"],
  },
  {
    slug: "semaglutide",
    displayName: "Semaglutide",
    aliases: ["sema", "ozempic", "wegovy", "rybelsus"],
    category: "weight-loss",
    description:
      "GLP-1 receptor agonist for weight management and glycemic control.",
    typicalDose: "0.25 mg start, titrated up to 2.4 mg weekly",
    frequency: "Once weekly, same day each week",
    halfLife: "~7 days",
    storage: "Refrigerate. Room temperature OK for up to 28 days after first use.",
    commonSideEffects: ["Nausea", "Constipation", "Reflux", "Fatigue"],
    fastedOrFed: "Can be taken with or without food",
  },
  {
    slug: "tirzepatide",
    displayName: "Tirzepatide",
    aliases: ["tirz", "mounjaro", "zepbound"],
    category: "weight-loss",
    description:
      "Dual GLP-1/GIP receptor agonist for weight management and type 2 diabetes.",
    typicalDose: "2.5 mg start, titrated up to 15 mg weekly",
    frequency: "Once weekly, same day each week",
    halfLife: "~5 days",
    storage: "Refrigerate. Room temperature OK short-term.",
    commonSideEffects: ["Nausea", "Diarrhea", "Constipation", "Reduced appetite"],
    fastedOrFed: "Can be taken with or without food",
  },
  {
    slug: "retatrutide",
    displayName: "Retatrutide",
    aliases: ["reta", "triple agonist"],
    category: "weight-loss",
    description:
      "Triple agonist (GLP-1/GIP/Glucagon), next-generation weight management peptide.",
    typicalDose: "2 mg start, titrated up to 12 mg weekly",
    frequency: "Once weekly",
    halfLife: "~5 days",
    storage: "Refrigerate after reconstitution. Use within 28 days.",
    commonSideEffects: ["Nausea", "Vomiting", "Diarrhea", "Injection site reactions"],
  },
  {
    slug: "cjc-1295",
    displayName: "CJC-1295",
    aliases: ["cjc", "cjc1295", "dac"],
    category: "growth",
    description:
      "Growth hormone-releasing hormone analog, often stacked with Ipamorelin.",
    typicalDose: "100–300 mcg",
    frequency: "1–2x daily (usually before bed, fasted)",
    halfLife: "~8 days with DAC; ~30 min without DAC",
    storage: "Refrigerate after reconstitution. Use within 28 days.",
    commonSideEffects: ["Tingling", "Flushing", "Headache"],
    fastedOrFed: "Best taken fasted, especially before bed",
  },
  {
    slug: "ipamorelin",
    displayName: "Ipamorelin",
    aliases: ["ipa", "ipamorelin"],
    category: "growth",
    description:
      "Growth hormone secretagogue with selective GH release and minimal side effects.",
    typicalDose: "200–300 mcg",
    frequency: "1–3x daily (before bed and/or pre-workout)",
    halfLife: "~2 hours",
    storage: "Refrigerate after reconstitution. Use within 28 days.",
    commonSideEffects: ["Mild flushing", "Hunger increase"],
    fastedOrFed: "Best fasted to avoid insulin interference",
  },
  {
    slug: "hcg",
    displayName: "HCG",
    aliases: ["hcg", "human chorionic gonadotropin"],
    category: "hormonal",
    description:
      "Luteinizing hormone analog used to restore natural testosterone production.",
    typicalDose: "250–500 IU (note: HCG is dosed in IU, not mcg)",
    frequency: "2–3x weekly",
    halfLife: "~36 hours",
    storage: "Must be refrigerated. Use within 28 days of reconstitution.",
    commonSideEffects: ["Water retention", "Acne", "Mood changes"],
  },
  {
    slug: "sermorelin",
    displayName: "Sermorelin",
    aliases: ["sermorelin"],
    category: "growth",
    description:
      "GHRH analog that stimulates natural growth hormone release.",
    typicalDose: "200–500 mcg",
    frequency: "Once daily, before bed",
    halfLife: "~15 minutes",
    storage: "Refrigerate. Use within 30 days of reconstitution.",
    commonSideEffects: ["Flushing", "Injection site reactions"],
    fastedOrFed: "Best taken fasted before bed",
  },
  {
    slug: "pt-141",
    displayName: "PT-141",
    aliases: ["pt141", "bremelanotide"],
    category: "sexual-health",
    description: "Melanocortin receptor agonist for sexual dysfunction.",
    typicalDose: "0.5–2 mg",
    frequency: "As needed, up to 1 hour before activity",
    halfLife: "~2 hours",
    storage: "Refrigerate after reconstitution.",
    commonSideEffects: ["Nausea", "Flushing", "Headache"],
  },
];

/**
 * Escape string for use in a RegExp.
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Test a query for a word-boundary match of a term.
 * Short terms like "bpc" or "reta" would give false positives with .includes(),
 * so we use word boundaries. Dashes are treated as word chars.
 */
function matchesTerm(query: string, term: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9-])${escapeRegExp(term)}([^a-z0-9-]|$)`, "i");
  return pattern.test(query);
}

/**
 * Find a peptide by any keyword in its name or aliases.
 */
export function findPeptideByKeyword(query: string): PeptideKnowledge | null {
  const lower = query.toLowerCase();
  for (const peptide of PEPTIDE_KNOWLEDGE) {
    if (matchesTerm(lower, peptide.slug.toLowerCase())) return peptide;
    if (matchesTerm(lower, peptide.displayName.toLowerCase())) return peptide;
    for (const alias of peptide.aliases) {
      if (matchesTerm(lower, alias.toLowerCase())) return peptide;
    }
  }
  return null;
}

/**
 * Generate a fallback reply when no API key is available.
 * Uses keyword matching against the user's query + their context.
 */
export function fallbackAnswer(query: string, context: string): string {
  const lower = query.toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|sup|yo)\b/.test(lower)) {
    return "Hi! I'm PeptidePin's assistant. I can help you understand your own peptides, vials, and schedules. Try asking 'how much BPC do I have left?' or 'when does my vial expire?'";
  }

  // Thank you
  if (lower.includes("thank")) {
    return "You're welcome. Let me know if you have other questions.";
  }

  // Medical advice refusal
  if (
    lower.match(/should i take|is it safe|can i (take|use|stack)|dangerous|overdose|too much/)
  ) {
    return "I can't advise on dosing decisions or drug interactions — talk to your doctor for medical guidance. I can help you track what you already have set up.";
  }

  // User is asking about their runway/stock
  if (
    lower.match(/how much|how many|run out|remaining|left|when.*(end|run out|finish)/)
  ) {
    if (context.includes("Active Vials")) {
      return `Here's your current stack:\n\n${context}\n\nFor detailed runway forecasts, check the Vial Runway card on your dashboard.`;
    }
    return "You don't have any active vials yet. Add one from the dashboard or the 'My Vials' page to start tracking.";
  }

  // User is asking about a specific peptide
  const peptide = findPeptideByKeyword(query);
  if (peptide) {
    return [
      `**${peptide.displayName}** — ${peptide.description}`,
      ``,
      `- Typical dose: ${peptide.typicalDose}`,
      `- Frequency: ${peptide.frequency}`,
      `- Half-life: ${peptide.halfLife}`,
      `- Storage: ${peptide.storage}`,
      peptide.fastedOrFed ? `- Timing: ${peptide.fastedOrFed}` : "",
      ``,
      `Common side effects: ${peptide.commonSideEffects.join(", ")}`,
      ``,
      `This is general info — consult your doctor for personal guidance.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // Default fallback
  return [
    "I'm running in offline mode right now (no AI connection). I can still answer:",
    "",
    "- Questions about specific peptides (BPC-157, Tirzepatide, etc.)",
    "- Your current vial status and runway",
    "- General dosing info from my local knowledge base",
    "",
    "What would you like to know?",
  ].join("\n");
}
