import type { MetadataRoute } from "next"
import { prisma } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://anopongulam.ph"

  const recipes = await prisma.recipe.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/recipes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ]

  const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: recipe.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...recipePages]
}
