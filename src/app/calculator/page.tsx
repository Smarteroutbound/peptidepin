import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllPeptides } from "@/lib/peptide-data";
import { generateWebAppSchema, JsonLdScript } from "@/lib/seo";
import { CalculatorV2 } from "@/components/calculator/calculator-v2";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Peptide Calculator — Free Reconstitution & Dosage Calculator",
  description:
    "Free peptide reconstitution calculator. Calculate exact syringe units for any peptide vial. Supports semaglutide, tirzepatide, BPC-157, retatrutide, HCG, and 30+ more peptides.",
  openGraph: {
    title: "Peptide Calculator — Free Reconstitution & Dosage Calculator | PeptidePin",
    description:
      "Calculate exact syringe units for any peptide. Free, instant, with visual syringe guide.",
    url: "/calculator",
  },
};

export const revalidate = 86400; // ISR: revalidate every 24 hours

export default async function CalculatorHubPage() {
  const peptides = await getAllPeptides();

  // Group by category
  const categories = new Map<string, typeof peptides>();
  for (const p of peptides) {
    const cat = p.category || "other";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(p);
  }

  const categoryLabels: Record<string, string> = {
    "weight-loss": "Weight Loss (GLP-1)",
    healing: "Healing & Recovery",
    growth: "Growth Hormone",
    "anti-aging": "Anti-Aging",
    cognitive: "Cognitive",
    immune: "Immune",
    sleep: "Sleep",
    "sexual-health": "Sexual Health",
    other: "Other",
  };

  return (
    <article className="space-y-10">
      <JsonLdScript data={generateWebAppSchema()} />

      {/* Hero */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
          Peptide Dosage Calculator
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
          Free reconstitution calculator for any peptide. Enter your vial size,
          BAC water amount, and desired dose — get exact syringe units instantly.
          No signup required.
        </p>
      </div>

      {/* Generic calculator */}
      <section>
        <h2 className="text-xl font-heading font-semibold mb-4">
          Quick Calculator
        </h2>
        <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
          <CalculatorV2 syncUrl={true} />
        </Suspense>
      </section>

      {/* Peptide-specific calculators grid */}
      <section>
        <h2 className="text-xl font-heading font-semibold mb-6">
          Peptide-Specific Calculators
        </h2>
        <p className="text-muted-foreground mb-6">
          Select your peptide for a calculator pre-configured with the correct
          vial sizes, recommended doses, and protocol information.
        </p>

        {Array.from(categories.entries()).map(([cat, peptideList]) => (
          <div key={cat} className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {categoryLabels[cat] || cat}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {peptideList.map((p) => (
                <Link
                  key={p.slug}
                  href={`/calculator/${p.slug}`}
                  className="group block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </span>
                      {p.unit_type === "iu" && (
                        <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                          IU
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">
                      →
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <p className="text-xs text-primary/70 mt-2">
                    Calculate {p.name.toLowerCase()} dosing
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Related tools */}
      <section>
        <h2 className="text-lg font-heading font-semibold mb-4">
          More Tools
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/bac-water-calculator"
            className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium">BAC Water Calculator</span>
            <p className="text-xs text-muted-foreground mt-1">
              How much bacteriostatic water to add →
            </p>
          </Link>
          <Link
            href="/unit-converter"
            className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium">Unit Converter</span>
            <p className="text-xs text-muted-foreground mt-1">
              Convert mg ↔ mcg ↔ IU ↔ syringe units →
            </p>
          </Link>
        </div>
      </section>
    </article>
  );
}
