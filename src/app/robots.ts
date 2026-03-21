import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://peptidepin.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/my-peptides", "/schedule", "/settings", "/history", "/onboarding"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
