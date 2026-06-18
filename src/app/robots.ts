import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://anopongulam.ph"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings", "/login", "/register"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
