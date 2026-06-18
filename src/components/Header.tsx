"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { MdClose, MdMenu, MdAdd } from "react-icons/md"
import InstallPrompt from "./InstallPrompt"
import NotificationBell from "./NotificationBell"
import UserMenu from "./UserMenu"

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
      className={`transition-colors ${isActive ? "text-red-600 font-semibold" : "text-stone-600 hover:text-amber-600"}`}
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
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
              <Image src="/logo-no-bg.png" alt="" width={36} height={36} className="rounded" />
              <span className="font-bold text-lg tracking-tight">
                Ano Pong <span className="text-red-600">Ulam?</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              {session?.user && (
                <>
                  <NavLink href="/recipes">Recipes</NavLink>
                  <NavLink href="/challenges">Challenges</NavLink>
                  <NavLink href="/collections">Collections</NavLink>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!isNewRecipe && (
              <Link
                href="/recipes/new"
                className="hidden md:inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                <MdAdd className="text-base" />
                Share Recipe
              </Link>
            )}

            <div className="flex items-center gap-1.5">
              {session?.user ? (
                <>
                  <NotificationBell />
                  <UserMenu />
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-stone-600 hover:text-amber-600 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
            </button>
          </div>
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

              {session?.user ? (
                <>
                  {!isNewRecipe && (
                    <Link
                      href="/recipes/new"
                      onClick={closeMenu}
                      className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors mb-2"
                    >
                      <MdAdd className="text-base" />
                      Share Recipe
                    </Link>
                  )}
                  <NavLink href="/recipes" onClick={closeMenu}>Recipes</NavLink>
                  <NavLink href="/challenges" onClick={closeMenu}>Challenges</NavLink>
                  <NavLink href="/collections" onClick={closeMenu}>Collections</NavLink>
                  <div className="mt-3 pt-3 border-t border-stone-100" />
                  <NavLink href="/notifications" onClick={closeMenu}>Notifications</NavLink>
                  <NavLink href={`/u/${session.user.name}`} onClick={closeMenu}>Profile</NavLink>
                  <NavLink href="/settings" onClick={closeMenu}>Settings</NavLink>
                  <button
                    onClick={() => { signOut(); closeMenu() }}
                    className="text-left text-stone-500 hover:text-red-600 transition-colors py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block text-center bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
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
