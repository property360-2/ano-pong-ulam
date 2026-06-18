"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { MdRestaurant, MdClose, MdMenu } from "react-icons/md"
import InstallPrompt from "./InstallPrompt"
import NotificationBell from "./NotificationBell"

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href) && (pathname === href || pathname[href.length] === "/" || pathname[href.length] === undefined)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block transition-colors ${isActive ? "text-red-600 font-semibold" : "text-stone-700 hover:text-amber-600"}`}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const isNewRecipe = pathname.startsWith("/recipes/new")

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <MdRestaurant className="text-2xl" />
            <span className="font-bold text-lg tracking-tight">
              Ano Pong <span className="text-red-600">Ulam?</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            {!isNewRecipe && (
              <NavLink href="/recipes/new">Share Recipe</NavLink>
            )}
            <NavLink href="/recipes">Recipes</NavLink>
            <NavLink href="/challenges">Challenges</NavLink>
            <NavLink href="/collections">Collections</NavLink>
            {session?.user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
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

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-stone-600 hover:text-amber-600 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={closeMenu}
          />
          <div className="fixed top-16 right-0 w-72 bg-white border-l border-stone-200 shadow-lg z-50 md:hidden min-h-[calc(100vh-4rem)]">
            <nav className="flex flex-col p-4 gap-1 text-sm font-medium">
              <div className="mb-3 pb-3 border-b border-stone-100">
                <NavLink href="/" onClick={closeMenu}>Home</NavLink>
              </div>

              {!isNewRecipe && (
                <NavLink href="/recipes/new" onClick={closeMenu}>Share Recipe</NavLink>
              )}
              <NavLink href="/recipes" onClick={closeMenu}>Recipes</NavLink>
              <NavLink href="/challenges" onClick={closeMenu}>Challenges</NavLink>
              <NavLink href="/collections" onClick={closeMenu}>Collections</NavLink>

              {session?.user ? (
                <>
                  <div className="mt-3 pt-3 border-t border-stone-100" />
                  <NavLink href="/notifications" onClick={closeMenu}>Notifications</NavLink>
                  <NavLink href="/settings" onClick={closeMenu}>Settings</NavLink>
                  <button
                    onClick={() => { signOut(); closeMenu() }}
                    className="text-left text-stone-500 hover:text-stone-800 transition-colors py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block text-center bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </>
      )}

      <InstallPrompt />
    </>
  )
}
