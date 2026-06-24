import { Prisma, $Enums } from "@/generated/prisma/client"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import RecipeList from "@/components/RecipeList"
import SearchFilters from "@/components/SearchFilters"
import { MdSearch, MdRestaurantMenu } from "react-icons/md"
import Link from "next/link"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function RecipesPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const q = typeof searchParams.q === "string" ? searchParams.q : null
  const category = typeof searchParams.category === "string" ? searchParams.category : null
  const region = typeof searchParams.region === "string" ? searchParams.region : null
  const difficulty = typeof searchParams.difficulty === "string" ? searchParams.difficulty : null
  const tag = typeof searchParams.tag === "string" ? searchParams.tag : null
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : null

  const filters: Prisma.RecipeWhereInput[] = []
  if (category) {
    if (category === "breakfast") {
      filters.push({
        OR: [
          { category: { contains: "breakfast", mode: "insensitive" } },
          { category: { contains: "almusal", mode: "insensitive" } },
        ]
      })
    } else if (category === "fiesta") {
      filters.push({
        OR: [
          { category: { contains: "fiesta", mode: "insensitive" } },
          { category: { contains: "pampasko", mode: "insensitive" } },
        ]
      })
    } else if (category === "vegetable") {
      filters.push({
        OR: [
          { category: { contains: "gulay", mode: "insensitive" } },
          { category: { contains: "vegetable", mode: "insensitive" } },
        ]
      })
    } else {
      filters.push({
        category: { contains: category, mode: "insensitive" }
      })
    }
  }
  if (region) filters.push({ region })
  if (difficulty) filters.push({ difficulty: difficulty as $Enums.Difficulty })
  if (tag) filters.push({ tags: { has: tag } })
  if (q) {
    filters.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    })
  }

  const where: Prisma.RecipeWhereInput = { isPublished: true }
  if (filters.length > 0) where.AND = filters

  let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: "desc" }
  if (sort === "popular") orderBy = { likes: { _count: "desc" } }
  else if (sort === "quickest") orderBy = { cookTime: "asc" }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recipes: any[] = []
  let total = 0
  let categories: Array<{ name: string; count: number }> = []
  let regions: Array<{ name: string; count: number }> = []
  let dbError = false

  try {
    const results = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: { author: { select: { username: true } } },
        orderBy,
        take: 12,
      }),
      prisma.recipe.count({ where }),
    ])
    recipes = results[0]
    total = results[1]

    const catGroups = await prisma.recipe.groupBy({
      by: ["category"],
      where: { isPublished: true },
      _count: true,
      orderBy: { _count: { category: "desc" } },
    })
    categories = catGroups.map((c) => ({ name: c.category, count: c._count }))

    const regionGroups = await prisma.recipe.groupBy({
      by: ["region"],
      where: { isPublished: true, region: { not: null } },
      _count: true,
      orderBy: { _count: { region: "desc" } },
    })
    regions = regionGroups.filter((r) => r.region).map((r) => ({ name: r.region!, count: r._count }))
  } catch {
    dbError = true
  }

  const activeFilters = { q, category, region, difficulty, tag }
  const hasActiveFilters = Object.values(activeFilters).some(Boolean)

  if (dbError) {
    return (
      <>
        <Header />
        <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 text-center">
          <h2 className="text-xl font-bold mb-2">May problema sa paglo-load</h2>
          <p className="text-stone-500 mb-6">Subukan muli mamaya.</p>
          <Link
            href="/recipes"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Subukan Muli
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Discover Recipes</h1>
        <p className="text-stone-500 mb-8">
          Explore Filipino dishes shared by the community
        </p>

        <SearchFilters
          currentFilters={activeFilters}
          currentSort={sort}
          categories={categories}
          regions={regions}
        />

        {total === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <span className="text-5xl block mb-4">{hasActiveFilters ? <MdSearch /> : <MdRestaurantMenu />}</span>
            <h2 className="text-xl font-semibold mb-2">
              {hasActiveFilters ? "No recipes found" : "No recipes yet"}
            </h2>
            <p className="text-stone-500 mb-6">
              {hasActiveFilters ? "Try adjusting your filters" : "Be the first to share a recipe!"}
            </p>
            {hasActiveFilters ? (
              <Link
                href="/recipes"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Clear Filters
              </Link>
            ) : (
              <Link
                href="/recipes/new"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Share a Recipe
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-400 mb-4">
              {total} recipe{total !== 1 ? "s" : ""} found
            </p>
            <RecipeList initialRecipes={recipes.map((r) => ({ ...r, id: Number(r.id), createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }))} />
          </>
        )}
      </main>
    </>
  )
}
