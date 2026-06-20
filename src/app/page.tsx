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

  const latestRecipes = await prisma.recipe.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      author: { select: { username: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  return (
    <>
      <Header />
      <main className="flex-1">
        <HomeContent session={session} latestRecipes={latestRecipes} />
      </main>
    </>
  )
}
