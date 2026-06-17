"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍲</span>
          <span className="font-bold text-lg tracking-tight">
            Ano Pong <span className="text-red-600">Ulam?</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/recipes" className="hover:text-red-600 transition-colors">
            Recipes
          </Link>
          <Link href="/challenges" className="hover:text-red-600 transition-colors">
            Challenges
          </Link>
          <Link href="/recipes/new" className="hover:text-red-600 transition-colors">
            Share Recipe
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/u/${session.user.name}`}
                className="hover:text-red-600 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="text-stone-500 hover:text-stone-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
