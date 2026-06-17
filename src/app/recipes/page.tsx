import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import RecipeCard from "@/components/RecipeCard"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function RecipesPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const category = typeof searchParams.category === "string" ? searchParams.category : null
  const region = typeof searchParams.region === "string" ? searchParams.region : null
  const tag = typeof searchParams.tag === "string" ? searchParams.tag : null

  const where: Record<string, unknown> = { isPublished: true }
  if (category) where.category = category
  if (region) where.region = region
  if (tag) where.tags = { has: tag }

  const recipes = await prisma.recipe.findMany({
    where,
    include: { author: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Discover Recipes</h1>
        <p className="text-stone-500 mb-8">
          Explore Filipino dishes shared by the community
        </p>

        {recipes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <span className="text-5xl block mb-4">🍳</span>
            <h2 className="text-xl font-semibold mb-2">No recipes yet</h2>
            <p className="text-stone-500 mb-6">Be the first to share a recipe with the community!</p>
            <a
              href="/recipes/new"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Share a Recipe
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
