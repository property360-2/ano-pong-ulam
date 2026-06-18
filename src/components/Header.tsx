"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { MdRestaurant } from "react-icons/md"
import InstallPrompt from "./InstallPrompt"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href) && (pathname === href || pathname[href.length] === "/" || pathname[href.length] === undefined)

  return (
    <Link
      href={href}
      className={`transition-colors ${isActive ? "text-red-600 font-semibold" : "hover:text-amber-600"}`}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isNewRecipe = pathname.startsWith("/recipes/new")

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MdRestaurant className="text-2xl" />
            <span className="font-bold text-lg tracking-tight">
              Ano Pong <span className="text-red-600">Ulam?</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            {!isNewRecipe && (
              <NavLink href="/recipes/new">Share Recipe</NavLink>
            )}
            <NavLink href="/recipes">Recipes</NavLink>
            <NavLink href="/challenges">Challenges</NavLink>
            <NavLink href="/collections">Collections</NavLink>
            {session?.user ? (
              <div className="flex items-center gap-3">
                <NavLink href={`/u/${session.user.name}`}>Profile</NavLink>
                <NavLink href="/settings">Settings</NavLink>
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
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </header>
      <InstallPrompt />
    </>
  )
}
