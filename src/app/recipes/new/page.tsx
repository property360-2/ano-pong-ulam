"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { MdLock } from "react-icons/md"
import ErrorBoundary from "@/components/ErrorBoundary"

const RecipeForm = dynamic(() => import("@/components/RecipeForm"), {
  loading: () => null,
})

export default function NewRecipePage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4"><MdLock /></span>
          <h1 className="text-xl font-bold mb-2">Sign in to share a recipe</h1>
          <p className="text-stone-500 mb-6">
            You need an account to share recipes with the community.
          </p>
          <Link
            href="/login"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <p className="text-stone-500">Failed to load recipe form. Please try again.</p>
        <Link href="/recipes/new" className="mt-3 text-amber-600 hover:underline">Reload</Link>
      </div>
    }>
      <RecipeForm mode="create" />
    </ErrorBoundary>
  )
}
