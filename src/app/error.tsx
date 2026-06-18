"use client"

import { useEffect } from "react"
import Link from "next/link"
import { MdErrorOutline, MdRefresh, MdHome } from "react-icons/md"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdErrorOutline className="text-3xl text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-stone-500 mb-2">An unexpected error occurred.</p>
        {error.digest && (
          <p className="text-xs text-stone-400 mb-6">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            <MdRefresh /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-stone-600 px-5 py-2.5 rounded-xl font-medium border border-stone-300 hover:bg-stone-50 transition-colors"
          >
            <MdHome /> Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
