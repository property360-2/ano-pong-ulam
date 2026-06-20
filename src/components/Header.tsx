/**
 * @file Header.tsx
 * @description Main application navigation header. Handles responsive desktop/mobile menus,
 * dynamic session-state visual skeletons to avoid Cumulative Layout Shift (CLS), and exposes PWA install prompts.
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { MdClose, MdMenu, MdAdd } from "react-icons/md"
import { useLanguage } from "@/lib/i18n"
import InstallPrompt from "./InstallPrompt"
import NotificationBell from "./NotificationBell"
import UserMenu from "./UserMenu"
import LanguageSwitcher from "./LanguageSwitcher"

/**
 * NavLink component.
 * Renders a link that visually highlights itself when the current route matches the href destination.
 * 
 * @param {Object} props Component properties.
 * @param {string} props.href Destination URL.
 * @param {React.ReactNode} props.children Link label or elements.
 * @param {Function} [props.onClick] Click handler, e.g. to dismiss menus.
 * @param {string} [props.className=""] Additional CSS classes.
 * @returns {JSX.Element} The active-state-aware navigation link.
 */
function NavLink({ href, children, onClick, className = "" }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string }) {
  const pathname = usePathname()
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href) && (pathname === href || pathname[href.length] === "/" || pathname[href.length] === undefined)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`transition-colors min-h-[44px] flex items-center px-2 ${isActive ? "text-red-600 font-semibold" : "text-stone-600 hover:text-amber-600"} ${className}`}
    >
      {children}
    </Link>
  )
}

/**
 * Header component.
 * Main navigation bar rendering branding logo, main pages list, session interactions, notification bell,
 * and a mobile side-drawer menu. Employs pulse skeletons during authorization state queries to block CLS.
 * 
 * @returns {JSX.Element} The rendered header bar.
 */
export default function Header() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
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
            <Link href="/" className="flex items-center gap-2 min-h-[44px]" onClick={closeMenu}>
              <Image src="/logo-no-bg.png" alt="" width={28} height={28} className="sm:w-9 sm:h-9 w-7 h-7 rounded" />
              <span className="hidden sm:inline font-bold text-lg tracking-tight">
                Ano Pong <span className="text-red-600">Ulam?</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              {session?.user && (
                <>
                  <NavLink href="/feed">{t("nav.feed")}</NavLink>
                  <NavLink href="/recipes">{t("nav.recipes")}</NavLink>
                  <NavLink href="/meal-planner">{t("nav.planner")}</NavLink>
                  <NavLink href="/collections">{t("nav.collections")}</NavLink>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {!isNewRecipe && (
              <Link
                href="/recipes/new"
                className="hidden md:inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm min-h-[44px]"
              >
                <MdAdd className="text-base" />
                {t("nav.share_recipe")}
              </Link>
            )}

            <div className="hidden md:block"><LanguageSwitcher /></div>

            <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse" />
              ) : session?.user ? (
                <>
                  <NotificationBell />
                  <UserMenu />
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  {t("nav.sign_in")}
                </Link>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-3 text-stone-600 hover:text-amber-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                <NavLink href="/" onClick={closeMenu} className="py-3 min-h-[44px] flex items-center">{t("nav.home")}</NavLink>
              </div>

              {session?.user ? (
                <>
                  <div className="mt-0 pt-0 border-t border-stone-100" />
                  <NavLink href="/notifications" onClick={closeMenu} className="py-3 min-h-[44px] flex items-center">{t("nav.notifications")}</NavLink>
                  <NavLink href={`/u/${session.user.name}`} onClick={closeMenu} className="py-3 min-h-[44px] flex items-center">{t("nav.profile")}</NavLink>
                  <NavLink href="/settings" onClick={closeMenu} className="py-3 min-h-[44px] flex items-center">{t("nav.settings")}</NavLink>
                  <button
                    onClick={() => { signOut(); closeMenu() }}
                    className="w-full text-left text-stone-500 hover:text-red-600 transition-colors py-3 min-h-[44px] flex items-center"
                  >
                    {t("nav.sign_out")}
                  </button>
                </>
              ) : (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block text-center bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors min-h-[44px]"
                  >
                    {t("nav.sign_in")}
                  </Link>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        </>
      )}

      <InstallPrompt />
    </>
  )
}

