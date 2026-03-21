/**
 * Static knowledge base for popular peptides.
 * Provides educational context for the guided wizard.
 */

export interface PeptideKnowledge {
  slug: string;
  whatIsIt: string;
  howItWorks: string;
  commonUses: string[];
  sideEffects: string[];
  whenToInject: string;
  fastedOrFed: string;
  injectionSites: string[];
  storageBefore: string;
  storageAfter: string;
  importantNotes: string[];
  weekByWeek?: string[];
}

const KNOWLEDGE_BASE: Record<string, PeptideKnowledge> = {
  semaglutide: {
    slug: "semaglutide",
    whatIsIt:
      "Semaglutide is a GLP-1 receptor agonist originally developed for type 2 diabetes. It mimics the incretin hormone GLP-1, which regulates blood sugar and appetite. It has a long 7-day half-life, making it a once-weekly injection.",
    howItWorks:
      "It binds to GLP-1 receptors in the brain and gut, slowing gastric emptying, reducing appetite, and increasing satiety. This leads to reduced caloric intake and significant weight loss over time.",
    commonUses: [
      "Weight management and fat loss",
      "Type 2 diabetes blood sugar control",
      "Cardiovascular risk reduction in obese patients",
    ],
    sideEffects: [
      "Nausea (very common in first 2-4 weeks, usually subsides)",
      "Constipation or diarrhea",
      "Decreased appetite (intended effect)",
      "Injection site reactions (mild)",
      "Headache and fatigue initially",
      "Rare: pancreatitis, gallbladder issues at higher doses",
    ],
    whenToInject:
      "Once weekly, same day each week. Any time of day. Most people choose a day where they can rest if nausea occurs (e.g. Friday evening).",
    fastedOrFed:
      "No fasting required. Can inject at any time regardless of meals. However, many users prefer injecting before their lightest meal day.",
    injectionSites: [
      "Abdomen (most common, 2 inches from navel)",
      "Front of thigh",
      "Back of upper arm",
    ],
    storageBefore:
      "Unreconstituted: refrigerate at 36-46F (2-8C). Do not freeze. Protect from light.",
    storageAfter:
      "After reconstitution: refrigerate and use within 28 days. Do not freeze reconstituted solution.",
    importantNotes: [
      "Always start at the lowest dose (0.25 mg) and titrate up every 4 weeks",
      "Nausea typically decreases after the first 2-4 weeks at each dose level",
      "Stay hydrated - dehydration worsens side effects",
      "Do not mix with other medications in the same syringe",
      "If you miss a dose, take it as soon as possible if within 5 days of the missed dose",
    ],
    weekByWeek: [
      "Weeks 1-4: 0.25 mg/week - adjustment period, mild appetite reduction",
      "Weeks 5-8: 0.5 mg/week - noticeable appetite suppression, potential nausea",
      "Weeks 9-12: 1.0 mg/week - significant appetite changes, steady weight loss",
      "Weeks 13-16: 1.7 mg/week - continued progress, most side effects resolved",
      "Weeks 17+: 2.4 mg/week (if needed) - maintenance dose for maximum effect",
    ],
  },

  tirzepatide: {
    slug: "tirzepatide",
    whatIsIt:
      "Tirzepatide is a dual GLP-1 and GIP receptor agonist. It activates both incretin pathways simultaneously, which may produce stronger effects on appetite, blood sugar, and weight loss compared to GLP-1-only medications.",
    howItWorks:
      "By activating both GLP-1 and GIP receptors, tirzepatide provides enhanced glucose-dependent insulin secretion, slowed gastric emptying, and potent appetite suppression. The dual action leads to greater weight loss in clinical trials.",
    commonUses: [
      "Weight loss (more potent than semaglutide in trials)",
      "Type 2 diabetes management",
      "Metabolic syndrome improvement",
    ],
    sideEffects: [
      "Nausea (common during titration, usually temporary)",
      "Diarrhea or constipation",
      "Decreased appetite",
      "Abdominal pain or discomfort",
      "Injection site reactions",
      "Rare: pancreatitis, hypoglycemia when combined with insulin",
    ],
    whenToInject:
      "Once weekly, same day each week. Any time of day. Pick a consistent day and stick with it.",
    fastedOrFed:
      "No fasting required. Can be taken regardless of meals.",
    injectionSites: [
      "Abdomen (preferred, rotate sites)",
      "Front of thigh",
      "Back of upper arm",
    ],
    storageBefore:
      "Refrigerate at 36-46F (2-8C) before reconstitution. Protect from light and heat.",
    storageAfter:
      "After reconstitution: refrigerate and use within 28 days. Keep vial upright.",
    importantNotes: [
      "Start at 2.5 mg weekly and increase by 2.5 mg every 4 weeks",
      "Maximum dose is 15 mg/week",
      "Do not increase dose if experiencing significant GI side effects - stay at current dose longer",
      "Slightly more potent for weight loss than semaglutide in head-to-head trials",
      "Can cause injection site reactions; rotate injection locations",
    ],
    weekByWeek: [
      "Weeks 1-4: 2.5 mg/week - initiation, body adjusts",
      "Weeks 5-8: 5.0 mg/week - appetite suppression begins",
      "Weeks 9-12: 7.5 mg/week - noticeable weight loss",
      "Weeks 13-16: 10.0 mg/week - significant results",
      "Weeks 17+: 12.5-15 mg/week (if needed) - maximum therapeutic dose",
    ],
  },

  retatrutide: {
    slug: "retatrutide",
    whatIsIt:
      "Retatrutide is an investigational triple agonist that activates GLP-1, GIP, and glucagon receptors. It is the first triple-hormone receptor agonist in clinical trials for obesity, showing unprecedented weight loss results.",
    howItWorks:
      "The triple agonism provides appetite suppression (GLP-1/GIP), enhanced energy expenditure via glucagon receptor activation, and improved glucose metabolism. The glucagon component may increase fat burning beyond what dual agonists achieve.",
    commonUses: [
      "Weight loss (investigational, not yet FDA-approved)",
      "Obesity treatment in clinical trials",
      "Potential metabolic disease applications",
    ],
    sideEffects: [
      "Nausea and vomiting (common, especially during titration)",
      "Diarrhea",
      "Constipation",
      "Decreased appetite",
      "Increased heart rate (from glucagon component)",
      "GI effects may be more pronounced than dual agonists",
    ],
    whenToInject:
      "Once weekly. Pick a consistent day. Consider a rest day in case of GI side effects.",
    fastedOrFed:
      "No specific fasting requirements in trial protocols. Can inject regardless of meal timing.",
    injectionSites: [
      "Abdomen",
      "Thigh",
      "Upper arm",
    ],
    storageBefore:
      "Refrigerate at 36-46F (2-8C). Protect from light. Do not freeze.",
    storageAfter:
      "After reconstitution: refrigerate and use within 28 days.",
    importantNotes: [
      "Not FDA-approved - only available through research or compounding",
      "Titrate slowly: start at 1 mg and increase every 4 weeks",
      "GI side effects can be more intense than sema or tirz due to triple action",
      "The glucagon component may increase energy expenditure but can raise heart rate",
      "Phase 2 trials showed up to 24% body weight loss at 48 weeks",
      "Monitor heart rate, especially during dose escalation",
    ],
    weekByWeek: [
      "Weeks 1-4: 1 mg/week - initiation and adjustment",
      "Weeks 5-8: 2 mg/week - beginning appetite suppression",
      "Weeks 9-12: 4 mg/week - noticeable weight loss acceleration",
      "Weeks 13-16: 8 mg/week - strong effects, monitor side effects",
      "Weeks 17+: 8-12 mg/week - maintenance at tolerated dose",
    ],
  },

  "bpc-157": {
    slug: "bpc-157",
    whatIsIt:
      "BPC-157 (Body Protection Compound-157) is a synthetic peptide derived from a protein found in gastric juice. It is widely researched for its regenerative and healing properties on tendons, ligaments, muscles, and the GI tract.",
    howItWorks:
      "BPC-157 promotes angiogenesis (new blood vessel formation), modulates nitric oxide pathways, upregulates growth factor receptors, and has anti-inflammatory effects. It accelerates healing in connective tissues and may protect the gut lining.",
    commonUses: [
      "Tendon and ligament injury recovery",
      "Muscle tear healing",
      "Gut healing (leaky gut, IBS, ulcers)",
      "Joint pain and inflammation reduction",
      "Post-surgical recovery support",
    ],
    sideEffects: [
      "Generally very well tolerated",
      "Mild injection site irritation",
      "Occasional nausea at higher doses",
      "Lightheadedness (rare)",
      "No serious adverse effects reported in research",
    ],
    whenToInject:
      "1-2 times daily. Morning and evening doses are common. Can inject close to the injury site for localized effect or subcutaneously in the abdomen for systemic effect.",
    fastedOrFed:
      "No fasting required. Can also be taken orally (capsule form) on an empty stomach for gut healing.",
    injectionSites: [
      "Subcutaneous near the injury site (for localized healing)",
      "Abdomen (for systemic effect)",
      "Thigh or upper arm (alternative sites)",
    ],
    storageBefore:
      "Lyophilized powder: store at room temperature or refrigerated. Stable for months when dry.",
    storageAfter:
      "After reconstitution: refrigerate at 36-46F (2-8C). Use within 30 days. Do not freeze.",
    importantNotes: [
      "Typical cycle: 4-8 weeks, then take a break",
      "250-500 mcg per injection, 1-2 times daily",
      "Can inject near the injury site for targeted healing",
      "Often stacked with TB-500 for enhanced healing",
      "Very short half-life (minutes) but sustained biological effects",
      "Stable peptide - less fragile than many others",
      "Research is mostly animal-based; human clinical data is limited",
    ],
  },

  "tb-500": {
    slug: "tb-500",
    whatIsIt:
      "TB-500 is a synthetic version of Thymosin Beta-4, a naturally occurring peptide in nearly all human cells. It plays a critical role in tissue repair, cell migration, and reducing inflammation throughout the body.",
    howItWorks:
      "TB-500 promotes cell migration and proliferation by upregulating actin, a cell-building protein. This allows cells to move to damaged areas faster. It also reduces inflammation, prevents adhesion formation, and promotes new blood vessel growth.",
    commonUses: [
      "Systemic tissue repair and recovery",
      "Muscle and tendon healing",
      "Reducing inflammation and scar tissue",
      "Wound healing acceleration",
      "Hair regrowth support",
      "Cardiac tissue protection",
    ],
    sideEffects: [
      "Generally well tolerated",
      "Temporary lethargy or fatigue after injection",
      "Head rush or lightheadedness (uncommon)",
      "Mild injection site irritation",
      "Temporary flu-like symptoms during loading phase (rare)",
    ],
    whenToInject:
      "During loading phase: 2 times per week. During maintenance: once per week. Inject at a consistent time.",
    fastedOrFed:
      "No fasting required. Can inject at any time regardless of meals.",
    injectionSites: [
      "Abdomen (subcutaneous, most common)",
      "Thigh",
      "Upper arm",
    ],
    storageBefore:
      "Lyophilized powder: store refrigerated or at room temperature. Stable when dry.",
    storageAfter:
      "After reconstitution: refrigerate at 36-46F (2-8C). Use within 21-30 days.",
    importantNotes: [
      "Loading phase: 2.5 mg twice per week for 4-6 weeks",
      "Maintenance phase: 2 mg once per week",
      "Works systemically - no need to inject near injury",
      "Often stacked with BPC-157 for synergistic healing effects",
      "Full cycle is typically 8-12 weeks",
      "Effects are systemic rather than localized (unlike BPC-157)",
      "Some users report improved flexibility and reduced joint stiffness",
    ],
  },

  hcg: {
    slug: "hcg",
    whatIsIt:
      "HCG (Human Chorionic Gonadotropin) is a hormone naturally produced during pregnancy. In men, it mimics luteinizing hormone (LH) to stimulate testosterone production and maintain testicular function. It uses IU (International Units) for dosing.",
    howItWorks:
      "HCG binds to LH receptors in the testes, stimulating Leydig cells to produce testosterone. This is especially useful during or after testosterone therapy to prevent testicular atrophy and maintain fertility.",
    commonUses: [
      "Testosterone support during TRT (prevents testicular atrophy)",
      "Male fertility preservation and enhancement",
      "Post-cycle therapy (PCT) after steroid use",
      "Hypogonadism treatment",
      "Weight loss protocols (controversial)",
    ],
    sideEffects: [
      "Water retention and bloating",
      "Mood swings or irritability",
      "Headaches",
      "Gynecomastia (due to estrogen conversion)",
      "Injection site pain or swelling",
      "Acne (from increased testosterone)",
    ],
    whenToInject:
      "For TRT support: 2-3 times per week (e.g. Monday/Wednesday/Friday). For fertility: as directed by physician, typically every other day.",
    fastedOrFed:
      "No fasting required. Can inject at any time.",
    injectionSites: [
      "Subcutaneous abdomen (most common)",
      "Intramuscular in thigh or deltoid",
      "Subcutaneous thigh",
    ],
    storageBefore:
      "Unreconstituted: can be stored at room temperature. Refrigeration extends shelf life.",
    storageAfter:
      "After reconstitution: must be refrigerated at 36-46F (2-8C). Use within 60 days. Some formulations only 30 days.",
    importantNotes: [
      "Dosed in IU (International Units), not mcg or mg",
      "TRT support: 250-500 IU, 2-3 times per week",
      "Fertility doses are higher: 1000-2000 IU, 2-3 times per week",
      "Can increase estrogen - monitor E2 levels",
      "Reconstituted HCG is fragile - do not shake, roll gently",
      "Use bacteriostatic water (BAC water), not sterile water",
      "Keep refrigerated after mixing - HCG degrades faster than most peptides",
      "Must be prescribed; it is a controlled substance in many jurisdictions",
    ],
  },
};

/**
 * Look up knowledge for a peptide by slug.
 * Returns null if no knowledge entry exists.
 */
export function getPeptideKnowledge(slug: string): PeptideKnowledge | null {
  return KNOWLEDGE_BASE[slug] ?? null;
}

/**
 * Get all available slugs with knowledge entries.
 */
export function getKnownPeptideSlugs(): string[] {
  return Object.keys(KNOWLEDGE_BASE);
}
