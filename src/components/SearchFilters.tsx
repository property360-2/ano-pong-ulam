"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type FilterOption = { name: string; count: number }

type ActiveFilters = {
  q: string | null
  category: string | null
  region: string | null
  difficulty: string | null
  tag: string | null
}

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "quickest", label: "Quickest" },
]

function buildUrl(filters: ActiveFilters, sort: string | null): string {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.category) params.set("category", filters.category)
  if (filters.region) params.set("region", filters.region)
  if (filters.difficulty) params.set("difficulty", filters.difficulty)
  if (filters.tag) params.set("tag", filters.tag)
  if (sort && sort !== "newest") params.set("sort", sort)
  const qs = params.toString()
  return qs ? `/recipes?${qs}` : "/recipes"
}

export default function SearchFilters({
  currentFilters,
  currentSort,
  categories,
  regions,
}: {
  currentFilters: ActiveFilters
  currentSort: string | null
  categories: FilterOption[]
  regions: FilterOption[]
}) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(currentFilters.q ?? "")

  function navigate(updates: Partial<ActiveFilters>, sort?: string | null) {
    const merged: ActiveFilters = { ...currentFilters, ...updates }
    const s = sort !== undefined ? sort : currentSort
    router.push(buildUrl(merged, s))
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate({ q: searchInput || null })
  }

  function clearAll() {
    setSearchInput("")
    router.push("/recipes")
  }

  const hasActiveFilters = Object.values(currentFilters).some(Boolean)

  return (
    <div className="space-y-4 mb-8">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search recipes..."
          className="flex-1 px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        <select
          value={currentFilters.category ?? ""}
          onChange={(e) => navigate({ category: e.target.value || null })}
          className="px-3 py-2 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>

        <select
          value={currentFilters.region ?? ""}
          onChange={(e) => navigate({ region: e.target.value || null })}
          className="px-3 py-2 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.difficulty ?? ""}
          onChange={(e) => navigate({ difficulty: e.target.value || null })}
          className="px-3 py-2 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Any Difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={currentSort ?? "newest"}
          onChange={(e) => navigate({}, e.target.value)}
          className="px-3 py-2 border border-stone-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="px-3 py-2 text-sm text-stone-500 hover:text-amber-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.q && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full">
              &ldquo;{currentFilters.q}&rdquo;
              <button
                onClick={() => {
                  setSearchInput("")
                  navigate({ q: null })
                }}
                className="hover:text-amber-900 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {currentFilters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full capitalize">
              {currentFilters.category}
              <button
                onClick={() => navigate({ category: null })}
                className="hover:text-amber-900 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {currentFilters.region && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full capitalize">
              {currentFilters.region}
              <button
                onClick={() => navigate({ region: null })}
                className="hover:text-amber-900 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {currentFilters.difficulty && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full capitalize">
              {currentFilters.difficulty}
              <button
                onClick={() => navigate({ difficulty: null })}
                className="hover:text-amber-900 font-bold"
              >
                ×
              </button>
            </span>
          )}
          {currentFilters.tag && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full">
              #{currentFilters.tag}
              <button
                onClick={() => navigate({ tag: null })}
                className="hover:text-amber-900 font-bold"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
