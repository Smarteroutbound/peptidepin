import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPeptideSlugs, getPeptideBySlug } from "@/lib/peptide-data";
import {
  generateCalculatorMetadata,
  generateFAQSchema,
  generateHowToSchema,
  generateWebAppSchema,
  generateBreadcrumbSchema,
  JsonLdScript,
} from "@/lib/seo";
import { CalculatorWithMode } from "@/components/calculator/calculator-with-mode";
import { Badge } from "@/components/ui/badge";
import { formatNumber, mcgToMg } from "@/lib/calculations";
import { ChevronRight } from "lucide-react";

export const revalidate = 86400; // ISR: 24 hours

export async function generateStaticParams() {
  const slugs = await getAllPeptideSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide) return { title: "Calculator Not Found" };
  return generateCalculatorMetadata(peptide);
}

export default async function PeptideCalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide) notFound();

  const isIU = peptide.unit_type === "iu";
  const unitLabel = isIU ? "IU" : "mcg";
  const hasTitration = peptide.titration_steps.length > 0;

  // Related peptides (same category, excluding self)
  const relatedSlugs = [
    "semaglutide",
    "tirzepatide",
    "bpc-157",
    "retatrutide",
    "tb-500",
    "hcg",
    "ipamorelin",
    "cjc-1295-no-dac",
  ].filter((s) => s !== slug);

  return (
    <article className="space-y-8">
      {/* Structured data */}
      {peptide.faq && peptide.faq.length > 0 && (
        <JsonLdScript data={generateFAQSchema(peptide.faq)} />
      )}
      {peptide.how_to_calculate && (
        <JsonLdScript
          data={generateHowToSchema(peptide.name, peptide.how_to_calculate)}
        />
      )}
      <JsonLdScript data={generateWebAppSchema()} />
      <JsonLdScript
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Calculator", url: "/calculator" },
          { name: peptide.name, url: `/calculator/${peptide.slug}` },
        ])}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/calculator" className="hover:text-foreground">
          Calculator
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{peptide.name}</span>
      </nav>

      {/* H1 + intro */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
          {peptide.name} Dosage Calculator
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {peptide.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {peptide.category && (
            <Badge variant="outline" className="capitalize">
              {peptide.category.replace("-", " ")}
            </Badge>
          )}
          {peptide.recommended_frequency && (
            <Badge variant="secondary">{peptide.recommended_frequency}</Badge>
          )}
          {peptide.half_life_hours && (
            <Badge variant="secondary">
              Half-life: {peptide.half_life_hours >= 24
                ? `${Math.round(peptide.half_life_hours / 24)} days`
                : `${peptide.half_life_hours} hours`}
            </Badge>
          )}
          {isIU && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              IU-based
            </Badge>
          )}
        </div>
      </div>

      {/* Size variant links */}
      {peptide.variants.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {peptide.variants.map((v) => (
            <Link
              key={v.id}
              href={`/calculator/${peptide.slug}/${v.size_label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {v.size_label}
            </Link>
          ))}
        </div>
      )}

      {/* Titration planner link */}
      {hasTitration && (
        <Link
          href={`/calculator/${peptide.slug}/titration`}
          className="block p-4 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all"
        >
          <span className="font-heading font-semibold text-primary">
            📅 {peptide.name} Titration Schedule & Planner
          </span>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your dose escalation timeline with vial consumption forecast
            and calendar export →
          </p>
        </Link>
      )}

      {/* Calculator */}
      <Suspense
        fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}
      >
        <CalculatorWithMode peptide={peptide} />
      </Suspense>

      {/* How to calculate section */}
      {peptide.how_to_calculate && (
        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">
            How to Calculate {peptide.name} Dosage
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{peptide.how_to_calculate}</p>
          </div>
        </section>
      )}

      {/* Reconstitution notes */}
      {peptide.reconstitution_notes && (
        <section>
          <h2 className="text-xl font-heading font-semibold mb-3">
            Reconstitution Guide
          </h2>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-foreground">
              {peptide.reconstitution_notes}
            </p>
            {peptide.storage_instructions && (
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Storage:</strong> {peptide.storage_instructions}
              </p>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      {peptide.faq && peptide.faq.length > 0 && (
        <section>
          <h2 className="text-xl font-heading font-semibold mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {peptide.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-lg border border-border overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium text-foreground pr-4">
                    {item.q}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="rounded-lg bg-primary/5 border border-primary/10 p-6 text-center">
        <h2 className="text-lg font-heading font-semibold mb-2">
          Track Your {peptide.name} Protocol
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Create a free account to save calculations, track doses, get
          reminders, and manage your vial inventory.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Create Free Account
        </Link>
      </section>

      {/* Related calculators */}
      <section>
        <h2 className="text-lg font-heading font-semibold mb-4">
          Related Calculators
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {relatedSlugs.slice(0, 6).map((s) => (
            <Link
              key={s}
              href={`/calculator/${s}`}
              className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <span className="font-medium text-sm capitalize">
                {s.replace(/-/g, " ").replace("no dac", "(no DAC)")} Calculator
              </span>
              <span className="text-xs text-muted-foreground block mt-0.5">
                Calculate dosing →
              </span>
            </Link>
          ))}
          <Link
            href="/bac-water-calculator"
            className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium text-sm">BAC Water Calculator</span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              How much BAC water to add →
            </span>
          </Link>
        </div>
      </section>
    </article>
  );
}
