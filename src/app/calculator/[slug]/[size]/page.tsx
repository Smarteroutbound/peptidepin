import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPeptideBySlug, getPeptideSizePages } from "@/lib/peptide-data";
import {
  generateCalculatorMetadata,
  generateBreadcrumbSchema,
  generateWebAppSchema,
  JsonLdScript,
} from "@/lib/seo";
import { CalculatorV2 } from "@/components/calculator/calculator-v2";
import { ChevronRight } from "lucide-react";

export const revalidate = 86400;

export async function generateStaticParams() {
  const pages = await getPeptideSizePages();
  return pages.map(({ slug, sizeLabel }) => ({
    slug,
    size: sizeLabel.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; size: string }>;
}): Promise<Metadata> {
  const { slug, size } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide) return { title: "Not Found" };

  const sizeLabel = size.replace(/-/g, " ");
  return generateCalculatorMetadata(peptide, sizeLabel);
}

export default async function SizeSpecificCalculatorPage({
  params,
}: {
  params: Promise<{ slug: string; size: string }>;
}) {
  const { slug, size } = await params;
  const peptide = await getPeptideBySlug(slug);
  if (!peptide) notFound();

  // Find matching variant
  const sizeNormalized = size.replace(/-/g, " ").toLowerCase();
  const variant = peptide.variants.find(
    (v) => v.size_label.toLowerCase() === sizeNormalized
  );
  if (!variant) notFound();

  const isIU = peptide.unit_type === "iu";

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
            name: variant.size_label,
            url: `/calculator/${peptide.slug}/${size}`,
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
        <span className="text-foreground font-medium">{variant.size_label}</span>
      </nav>

      {/* H1 */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
          {peptide.name} {variant.size_label} Dosage Calculator
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Calculate exact syringe units for a {variant.size_label}{" "}
          {peptide.name} vial. Pre-configured with{" "}
          {variant.common_bac_water_ml} mL BAC water default.
        </p>
      </div>

      {/* Other size links */}
      {peptide.variants.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">
            Other sizes:
          </span>
          {peptide.variants
            .filter((v) => v.id !== variant.id)
            .map((v) => (
              <Link
                key={v.id}
                href={`/calculator/${peptide.slug}/${v.size_label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm px-3 py-1 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors"
              >
                {v.size_label}
              </Link>
            ))}
        </div>
      )}

      {/* Calculator pre-filled with this variant */}
      <Suspense
        fallback={<div className="h-96 animate-pulse bg-muted rounded-lg" />}
      >
        <CalculatorV2
          peptide={peptide}
          defaultVariant={variant}
          syncUrl={true}
        />
      </Suspense>

      {/* Worked example */}
      <section>
        <h2 className="text-xl font-heading font-semibold mb-3">
          How to Calculate {peptide.name} {variant.size_label} Dosage
        </h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {peptide.how_to_calculate ? (
            <p>{peptide.how_to_calculate}</p>
          ) : (
            <p>
              For a {variant.size_label} {peptide.name} vial reconstituted
              with {variant.common_bac_water_ml} mL of bacteriostatic water,
              the concentration will be{" "}
              {(variant.size_mcg / variant.common_bac_water_ml).toLocaleString()}{" "}
              {isIU ? "IU" : "mcg"}/mL.{" "}
              {peptide.recommended_dose_mcg_min && (
                <>
                  For a dose of{" "}
                  {peptide.recommended_dose_mcg_min.toLocaleString()}{" "}
                  {isIU ? "IU" : "mcg"}, you would draw{" "}
                  {(
                    (peptide.recommended_dose_mcg_min /
                      (variant.size_mcg / variant.common_bac_water_ml)) *
                    100
                  ).toFixed(1)}{" "}
                  units on a U-100 insulin syringe.
                </>
              )}
            </p>
          )}
        </div>
      </section>

      {/* Back to main calculator */}
      <div className="flex gap-3">
        <Link
          href={`/calculator/${peptide.slug}`}
          className="text-sm text-primary hover:underline"
        >
          ← All {peptide.name} sizes
        </Link>
        <Link
          href="/calculator"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          All calculators
        </Link>
      </div>
    </article>
  );
}
