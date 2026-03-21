import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peptidepin.com";

  // Use service role or anon key for public reads
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all published peptides with their variants
  const { data: peptides } = await supabase
    .from("peptides")
    .select("slug, updated_at")
    .eq("is_published", true)
    .order("name");

  const { data: variants } = await supabase
    .from("peptide_variants")
    .select("peptide_id, size_label, peptides!inner(slug)")
    .order("sort_order");

  const { data: titrationPeptides } = await supabase
    .from("peptide_titration_steps")
    .select("peptide_id, peptides!inner(slug)")
    .order("step_number");

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bac-water-calculator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/unit-converter`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Per-peptide calculator pages
  const peptidePages: MetadataRoute.Sitemap = (peptides || []).map((p) => ({
    url: `${baseUrl}/calculator/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Per-peptide size-specific pages
  const sizePages: MetadataRoute.Sitemap = (variants || [])
    .filter((v: any) => v.peptides?.slug)
    .map((v: any) => ({
      url: `${baseUrl}/calculator/${v.peptides.slug}/${v.size_label.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Titration planner pages (deduplicated by peptide)
  const titrationSlugs = new Set<string>();
  const titrationPages: MetadataRoute.Sitemap = (titrationPeptides || [])
    .filter((t: any) => {
      const slug = t.peptides?.slug;
      if (!slug || titrationSlugs.has(slug)) return false;
      titrationSlugs.add(slug);
      return true;
    })
    .map((t: any) => ({
      url: `${baseUrl}/calculator/${t.peptides.slug}/titration`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticPages, ...peptidePages, ...sizePages, ...titrationPages];
}
