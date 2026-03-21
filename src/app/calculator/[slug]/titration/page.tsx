import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPeptideBySlug, getPeptidesWithTitration } from "@/lib/peptide-data";
import {
  generateTitrationMetadata,
  generateBreadcrumbSchema,
  generateWebAppSchema,
  JsonLdScript,
} from "@/lib/seo";
import { TitrationPlanner } from "@/components/calculator/titration-planner";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export const revalidate = 86400;

export async function generateStaticParams() {
  const peptides = await getPeptidesWithTitration();
  return peptides.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide || peptide.titration_steps.length === 0) {
    return { title: "Not Found" };
  }
  return generateTitrationMetadata(peptide);
}

export default async function TitrationPlannerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const peptide = await getPeptideBySlug(slug);

  if (!peptide || peptide.titration_steps.length === 0) {
    notFound();
  }

  const totalWeeks = peptide.titration_steps.reduce(
    (sum, s) => sum + (s.duration_weeks || 4),
    0
  );

  return (
    <article className="space-y-8">
      {/* Structured data */}
      <JsonLdScript data={generateWebAppSchema()} />
      <JsonLdScript
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Calculator", url: "/calculator" },
          { name: peptide.name, url: `/calculator/${peptide.slug}` },
          {
            name: "Titration Planner",
            url: `/calculator/${peptide.slug}/titration`,
          },
        ])}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/calculator" className="hover:text-foreground">Calculator</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/calculator/${peptide.slug}`} className="hover:text-foreground">
          {peptide.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Titration Planner</span>
      </nav>

      {/* H1 */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
          {peptide.name} Titration Schedule & Planner
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Plan your {peptide.name} dose escalation timeline. Set your start
          date to see a week-by-week calendar with dose amounts, vial
          consumption, and the date you&apos;ll reach your maintenance dose.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary">
            {peptide.titration_steps.length} dose steps
          </Badge>
          <Badge variant="secondary">~{totalWeeks} weeks to maintenance</Badge>
          <Badge variant="outline">{peptide.recommended_frequency}</Badge>
        </div>
      </div>

      {/* Titration steps overview */}
      <section>
        <h2 className="text-lg font-heading font-semibold mb-3">
          Dose Escalation Steps
        </h2>
        <div className="space-y-2">
          {peptide.titration_steps.map((step, i) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {step.step_number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {(step.dose_mcg / 1000).toFixed(step.dose_mcg % 1000 === 0 ? 0 : 1)}mg
                  {step.label && (
                    <span className="text-muted-foreground ml-2">
                      — {step.label}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.duration_weeks > 0
                    ? `${step.duration_weeks} weeks`
                    : "Ongoing maintenance"}
                  {step.notes && ` · ${step.notes}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive planner */}
      <Suspense
        fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}
      >
        <TitrationPlanner peptide={peptide} />
      </Suspense>

      {/* Link to calculator */}
      <section className="flex gap-4">
        <Link
          href={`/calculator/${peptide.slug}`}
          className="text-sm text-primary hover:underline"
        >
          ← {peptide.name} dosage calculator
        </Link>
        <Link
          href="/calculator"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          All calculators
        </Link>
      </section>
    </article>
  );
}
