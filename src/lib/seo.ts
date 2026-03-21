import type { PeptideWithVariants, PeptideFAQ } from '@/types/database'
import type { Metadata } from 'next'
import React from 'react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://peptidepin.com'
const APP_NAME = 'PeptidePin'

/**
 * Generate Next.js Metadata for a calculator page.
 * Optionally scoped to a specific vial size.
 */
export function generateCalculatorMetadata(
  peptide: PeptideWithVariants,
  sizeLabel?: string
): Metadata {
  const sizeSuffix = sizeLabel ? ` (${sizeLabel})` : ''
  const title =
    peptide.seo_title ||
    `${peptide.name}${sizeSuffix} Dosage Calculator | ${APP_NAME}`
  const description =
    peptide.seo_description ||
    `Calculate ${peptide.name}${sizeSuffix} reconstitution, dosage, and injection volume. Free peptide dosage calculator with syringe unit conversion.`

  const url = sizeLabel
    ? `${APP_URL}/calculator/${peptide.slug}/${sizeLabel.toLowerCase().replace(/\s+/g, '-')}`
    : `${APP_URL}/calculator/${peptide.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

/**
 * Generate Next.js Metadata for a titration planner page.
 */
export function generateTitrationMetadata(
  peptide: PeptideWithVariants
): Metadata {
  const title = `${peptide.name} Titration Schedule & Planner | ${APP_NAME}`
  const description = `Plan your ${peptide.name} titration schedule with step-by-step dose escalation. Free titration planner from ${APP_NAME}.`
  const url = `${APP_URL}/calculator/${peptide.slug}/titration`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

/**
 * Generate FAQPage JSON-LD schema from peptide FAQ data.
 */
export function generateFAQSchema(faqs: PeptideFAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

/**
 * Generate HowTo JSON-LD schema.
 * Splits the howToCalculate text into steps by newlines or numbered items.
 */
export function generateHowToSchema(
  peptideName: string,
  howToCalculate: string
) {
  // Split on newlines, numbered patterns like "1." or "1)", or bullet points
  const rawSteps = howToCalculate
    .split(/\n/)
    .map((s) => s.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim())
    .filter((s) => s.length > 0)

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Calculate ${peptideName} Dosage`,
    step: rawSteps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
  }
}

/**
 * Generate WebApplication JSON-LD schema for PeptidePin.
 */
export function generateWebAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: APP_NAME,
    url: APP_URL,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }
}

/**
 * Generate BreadcrumbList JSON-LD schema.
 */
export function generateBreadcrumbSchema(
  crumbs: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

/**
 * React component that renders a <script type="application/ld+json"> tag
 * for embedding structured data in the page head.
 */
export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data),
    },
  })
}
