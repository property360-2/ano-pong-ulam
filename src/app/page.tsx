/**
 * @file page.tsx
 * @description Root application homepage server component. Fetches session and latest recipes,
 * then delegates rendering to HomeContent client component for i18n support.
 */

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import HomeContent from "@/components/HomeContent"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const session = await auth()

  const topSlugs = [
    "pork_adobo", "pork_sinigang", "kare_kare", "lechon_baboy", "lechon_kawali",
    "chicken_inasal", "chicken_tinola", "bicol_express", "bulalo", "bistek_tagalog",
    "pancit_bihon", "lumpiang_shanghai", "halo_halo", "tortang_talong", "arroz_caldo",
    "pinakbet", "dinuguan", "beef_caldereta", "pork_menudo", "bibingka"
  ]

  const [latestRecipes, dbTopRecipes, mostSavedRecipes] = await Promise.all([
    prisma.recipe.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        author: { select: { username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.recipe.findMany({
      where: {
        slug: { in: topSlugs },
        isPublished: true,
      },
      include: {
        author: { select: { username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.recipe.findMany({
      where: { isPublished: true },
      orderBy: [
        { likes: { _count: "desc" } },
        { saves: { _count: "desc" } },
      ],
      take: 20,
      include: {
        author: { select: { username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
  ])

  return (
    <>
      <Header />
      <main className="flex-1">
        <HomeContent
          session={session}
          latestRecipes={latestRecipes}
          dbTopRecipes={dbTopRecipes}
          mostSavedRecipes={mostSavedRecipes}
        />
      </main>
    </>
  )
}
