"use client"

import { useEffect } from "react"
import Link from "next/link"
import { MdErrorOutline, MdRefresh, MdSearch } from "react-icons/md"

export default function RecipesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Recipes error:", error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdErrorOutline className="text-3xl text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Failed to load recipes</h1>
        <p className="text-stone-500 mb-6">Something went wrong while loading this page. Please try again.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            <MdRefresh /> Try Again
          </button>
          <Link
            href="/recipes"
            className="flex items-center gap-1.5 text-stone-600 px-5 py-2.5 rounded-xl font-medium border border-stone-300 hover:bg-stone-50 transition-colors"
          >
            <MdSearch /> Browse Recipes
          </Link>
        </div>
      </div>
    </div>
  )
}
