import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/** Create a Supabase client that works at build time (no cookies needed) */
function createStaticClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

/** Use static client for data fetching (works in generateStaticParams) */
async function getClient() {
  try {
    return await createServerClient()
  } catch {
    // Fallback for build-time (generateStaticParams) where cookies() isn't available
    return createStaticClient()
  }
}
import type {
  Peptide,
  PeptideVariant,
  TitrationStep,
  PeptideWithVariants,
} from '@/types/database'

/**
 * Get all published peptide slugs for generateStaticParams.
 */
export async function getAllPeptideSlugs(): Promise<{ slug: string }[]> {
  const supabase = await getClient()

  const { data, error } = await supabase
    .from('peptides')
    .select('slug')
    .eq('is_published', true)
    .order('name')

  if (error) {
    console.error('Error fetching peptide slugs:', error)
    return []
  }

  return data ?? []
}

/**
 * Get a single peptide by slug, including its variants and titration steps.
 * Returns null if not found or not published.
 */
export async function getPeptideBySlug(
  slug: string
): Promise<PeptideWithVariants | null> {
  const supabase = await getClient()

  const { data: peptideData, error } = await supabase
    .from('peptides')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !peptideData) {
    return null
  }

  // Cast to Peptide to avoid Supabase generic type issues
  const peptide = peptideData as Peptide
  const peptideId = peptide.id

  const [variantsResult, titrationResult] = await Promise.all([
    supabase
      .from('peptide_variants')
      .select('*')
      .eq('peptide_id', peptideId)
      .order('sort_order'),
    supabase
      .from('peptide_titration_steps')
      .select('*')
      .eq('peptide_id', peptideId)
      .order('step_number'),
  ])

  return {
    ...peptide,
    variants: (variantsResult.data as PeptideVariant[] | null) ?? [],
    titration_steps: (titrationResult.data as TitrationStep[] | null) ?? [],
  }
}

/**
 * Get all published peptides, ordered by name.
 */
export async function getAllPeptides(): Promise<Peptide[]> {
  const supabase = await getClient()

  const { data, error } = await supabase
    .from('peptides')
    .select('*')
    .eq('is_published', true)
    .order('name')

  if (error) {
    console.error('Error fetching peptides:', error)
    return []
  }

  return data ?? []
}

/**
 * Get all variants for a peptide, ordered by sort_order.
 */
export async function getAllPeptideVariants(
  peptideId: string
): Promise<PeptideVariant[]> {
  const supabase = await getClient()

  const { data, error } = await supabase
    .from('peptide_variants')
    .select('*')
    .eq('peptide_id', peptideId)
    .order('sort_order')

  if (error) {
    console.error('Error fetching peptide variants:', error)
    return []
  }

  return (data as PeptideVariant[] | null) ?? []
}

/**
 * Get all titration steps for a peptide, ordered by step_number.
 */
export async function getTitrationSteps(
  peptideId: string
): Promise<TitrationStep[]> {
  const supabase = await getClient()

  const { data, error } = await supabase
    .from('peptide_titration_steps')
    .select('*')
    .eq('peptide_id', peptideId)
    .order('step_number')

  if (error) {
    console.error('Error fetching titration steps:', error)
    return []
  }

  return (data as TitrationStep[] | null) ?? []
}

/**
 * Get data for generating /calculator/[slug]/[size] static params.
 * Returns slug + size info for every published peptide variant.
 */
export async function getPeptideSizePages(): Promise<
  { slug: string; sizeLabel: string; sizeMcg: number }[]
> {
  const supabase = await getClient()

  const { data, error } = await supabase
    .from('peptides')
    .select('slug, id')
    .eq('is_published', true)

  if (error || !data) {
    console.error('Error fetching peptides for size pages:', error)
    return []
  }

  const peptides = data as { slug: string; id: string }[]
  const peptideIds = peptides.map((p) => p.id)

  const { data: variants, error: variantsError } = await supabase
    .from('peptide_variants')
    .select('peptide_id, size_label, size_mcg')
    .in('peptide_id', peptideIds)
    .order('sort_order')

  if (variantsError || !variants) {
    console.error('Error fetching variants for size pages:', variantsError)
    return []
  }

  const slugById = new Map(peptides.map((p) => [p.id, p.slug]))
  const variantData = variants as { peptide_id: string; size_label: string; size_mcg: number }[]

  return variantData.map((v) => ({
    slug: slugById.get(v.peptide_id)!,
    sizeLabel: v.size_label,
    sizeMcg: v.size_mcg,
  }))
}

/**
 * Get published peptides that have titration steps,
 * for generating /calculator/[slug]/titration pages.
 */
export async function getPeptidesWithTitration(): Promise<
  PeptideWithVariants[]
> {
  const supabase = await getClient()

  // Get all titration steps to find which peptides have them
  const { data: titrationStepsRaw, error: titrationError } = await supabase
    .from('peptide_titration_steps')
    .select('peptide_id')

  if (titrationError || !titrationStepsRaw || titrationStepsRaw.length === 0) {
    return []
  }

  const titrationSteps = titrationStepsRaw as { peptide_id: string }[]
  const peptideIdsWithTitration = [
    ...new Set(titrationSteps.map((s) => s.peptide_id)),
  ]

  const { data: peptides, error } = await supabase
    .from('peptides')
    .select('*')
    .eq('is_published', true)
    .in('id', peptideIdsWithTitration)
    .order('name')

  if (error || !peptides) {
    return []
  }

  // Fetch variants and titration steps for each peptide in parallel
  const peptidesList = peptides as Peptide[]
  const results = await Promise.all(
    peptidesList.map(async (peptide) => {
      const [varResult, stepResult] = await Promise.all([
        supabase
          .from('peptide_variants')
          .select('*')
          .eq('peptide_id', peptide.id)
          .order('sort_order'),
        supabase
          .from('peptide_titration_steps')
          .select('*')
          .eq('peptide_id', peptide.id)
          .order('step_number'),
      ])

      return {
        ...peptide,
        variants: (varResult.data as PeptideVariant[] | null) ?? [],
        titration_steps: (stepResult.data as TitrationStep[] | null) ?? [],
      }
    })
  )

  return results
}
