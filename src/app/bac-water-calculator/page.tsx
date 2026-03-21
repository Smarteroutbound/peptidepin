import type { Metadata } from "next";
import { CalculatorV2 } from "@/components/calculator/calculator-v2";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bacteriostatic Water Calculator — How Much BAC Water for Peptides",
  description:
    "Free BAC water calculator. Calculate exactly how much bacteriostatic water to add to your peptide vial. Works for all vial sizes with visual syringe guide.",
  openGraph: {
    title: "Bacteriostatic Water Calculator | PeptidePin",
    description:
      "Calculate how much BAC water to add to your peptide vial. Free, instant, visual.",
  },
};

export default function BacWaterCalculatorPage() {
  return (
    <article className="space-y-8">
      {/* H1 */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-3">
          Bacteriostatic Water Calculator
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Calculate exactly how much bacteriostatic water (BAC water) to add
          when reconstituting your peptide vial. Enter your vial size and
          desired dose to see your concentration and exact syringe units.
        </p>
      </div>

      {/* Calculator */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}>
        <CalculatorV2 showCost={false} syncUrl={true} />
      </Suspense>

      {/* How to use section */}
      <section className="prose prose-sm dark:prose-invert max-w-none">
        <h2 className="text-xl font-heading font-semibold">
          How Much BAC Water Should You Add?
        </h2>
        <p>
          The amount of bacteriostatic water you add determines the
          <strong> concentration</strong> of your reconstituted peptide, which
          in turn determines how many units you need to draw for each dose.
        </p>
        <p>
          There is no single &quot;correct&quot; amount — it depends on your desired
          injection volume. Here are common approaches:
        </p>
        <ul>
          <li>
            <strong>1 mL</strong> — Higher concentration, smaller injection
            volume. Good for peptides where you want to inject as little fluid
            as possible.
          </li>
          <li>
            <strong>2 mL</strong> — Most popular choice. Provides a good
            balance between concentration and easy-to-measure doses.
          </li>
          <li>
            <strong>3 mL</strong> — Lower concentration, larger injection
            volume. Useful when you need very precise dosing of small amounts.
          </li>
        </ul>

        <h2 className="text-xl font-heading font-semibold mt-8">
          BAC Water vs Sterile Water
        </h2>
        <p>
          <strong>Bacteriostatic water</strong> contains 0.9% benzyl alcohol,
          which inhibits bacterial growth. Reconstituted peptides stored with
          BAC water remain stable for <strong>28-30 days</strong> when
          refrigerated.
        </p>
        <p>
          <strong>Sterile water</strong> has no preservative. Peptides
          reconstituted with sterile water must be used within{" "}
          <strong>24-48 hours</strong>. Always use BAC water for multi-dose
          vials.
        </p>
      </section>

      {/* Related calculators */}
      <section>
        <h2 className="text-lg font-heading font-semibold mb-4">
          Popular Peptide Calculators
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Semaglutide", slug: "semaglutide" },
            { name: "Tirzepatide", slug: "tirzepatide" },
            { name: "BPC-157", slug: "bpc-157" },
            { name: "Retatrutide", slug: "retatrutide" },
            { name: "HCG", slug: "hcg" },
          ].map((p) => (
            <Link
              key={p.slug}
              href={`/calculator/${p.slug}`}
              className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <span className="font-medium text-sm">{p.name} Calculator</span>
              <span className="text-xs text-muted-foreground block mt-0.5">
                Calculate {p.name.toLowerCase()} dosing →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
