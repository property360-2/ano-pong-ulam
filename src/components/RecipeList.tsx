/**
 * @file RecipeList.tsx
 * @description Client-side component displaying an infinite-scroll list of recipes.
 * Employs IntersectionObserver to fetch more recipes on scroll and syncs server-side filter updates.
 */

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import RecipeCard from "./RecipeCard"
import RecipeCardSkeleton from "./RecipeCardSkeleton"

type Recipe = {
  id: number
  slug: string
  title: string
  description: string | null
  heroImage: string | null
  prepTime: number | null
  cookTime: number | null
  difficulty: string | null
  category: string
  region: string | null
  tags: string[]
  createdAt: string
  author: { username: string } | null
}

/**
 * RecipeList component.
 * Displays recipes in a responsive grid and performs infinite scroll fetching on element intersection.
 * Syncs the initialRecipes prop updates directly during render to prevent effect cascades.
 * 
 * @param {Object} props Component properties.
 * @param {Recipe[]} props.initialRecipes The initial page of recipes fetched by the server component.
 * @returns {JSX.Element | null} The rendered recipe list layout.
 */
export default function RecipeList({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const searchParams = useSearchParams()
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [prevInitial, setPrevInitial] = useState<Recipe[]>(initialRecipes)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Sync props to state synchronously inside rendering (prevents useEffect render cycle)
  if (initialRecipes !== prevInitial) {
    setRecipes(initialRecipes)
    setHasMore(true)
    setPrevInitial(initialRecipes)
  }

  const hasInitialData = initialRecipes.length > 0

  /**
   * Generates a URL query string based on current browser parameters and offset coordinates.
   * 
   * @param {number} offset The current offset position (number of items already loaded).
   * @returns {string} The formatted URL query parameters.
   */
  const buildQueryString = useCallback((offset: number) => {
    const params = new URLSearchParams()
    const q = searchParams.get("q")
    const category = searchParams.get("category")
    const region = searchParams.get("region")
    const difficulty = searchParams.get("difficulty")
    const tag = searchParams.get("tag")
    const sort = searchParams.get("sort")
    if (q) params.set("q", q)
    if (category) params.set("category", category)
    if (region) params.set("region", region)
    if (difficulty) params.set("difficulty", difficulty)
    if (tag) params.set("tag", tag)
    if (sort) params.set("sort", sort)
    params.set("offset", String(offset))
    params.set("limit", "12")
    return params.toString()
  }, [searchParams])


  useEffect(() => {
    if (!hasInitialData || !hasMore) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !loading && hasMore) {
          setLoading(true)
          try {
            const offset = recipes.length
            const res = await fetch(`/api/recipes?${buildQueryString(offset)}`)
            const data = await res.json()
            if (data.recipes?.length > 0) {
              setRecipes((prev) => [...prev, ...data.recipes])
            }
            setHasMore(data.hasMore)
          } catch {
            // silent
          } finally {
            setLoading(false)
          }
        }
      },
      { rootMargin: "200px" }
    )

    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)

    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [hasInitialData, hasMore, loading, recipes.length, buildQueryString])

  if (recipes.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, idx) => (
          <RecipeCard key={recipe.id} recipe={recipe} priority={idx === 0} />
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </>
  )
}
