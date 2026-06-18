"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import RecipeCard from "./RecipeCard"

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

export default function RecipeList({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const searchParams = useSearchParams()
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const hasInitialData = initialRecipes.length > 0

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
    setRecipes(initialRecipes)
    setHasMore(true)
  }, [initialRecipes])

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
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-stone-400 text-sm">Loading more recipes...</p>
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </>
  )
}
