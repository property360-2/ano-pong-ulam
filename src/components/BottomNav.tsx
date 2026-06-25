/**
 * @file BottomNav.tsx
 * @description Bottom navigation bar component for mobile devices. Renders a sticky
 * bottom tab bar with key application routes (Feed, Recipes, Add Recipe, Meal Planner, Profile)
 * for screens under MD breakpoint, adjusting route targets dynamically based on session state.
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MdRssFeed, MdMenuBook, MdAdd, MdCalendarMonth, MdPerson } from "react-icons/md"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/lib/i18n"
import type { IconType } from "react-icons"

type Tab = {
  href: string
  labelKey: string
  icon: IconType
  isAdd?: boolean
}

const TABS: Tab[] = [
  { href: "/feed", labelKey: "nav.feed", icon: MdRssFeed },
  { href: "/recipes", labelKey: "nav.recipes", icon: MdMenuBook },
  { href: "/recipes/new", labelKey: "nav.share_recipe", icon: MdAdd, isAdd: true },
  { href: "/meal-planner", labelKey: "nav.planner", icon: MdCalendarMonth },
  { href: "/u/profile", labelKey: "nav.profile", icon: MdPerson },
]

/**
 * BottomNav component.
 * Renders the sticky bottom navigation bar with active states based on current route pathname.
 * It renders a floating red action button (FAB) in the middle for adding new recipes.
 * Only rendered on mobile devices (hidden above 'md' breakpoint).
 * 
 * @returns {JSX.Element|null} The bottom navigation bar element, or null if user is not authenticated.
 */
export default function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { t } = useLanguage()

  if (!session?.user) return null
  if (pathname === "/onboarding") return null

  const profileHref = `/u/${session.user.name}`

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const href = tab.href === "/u/profile" ? profileHref : tab.href
          const isActive = tab.href === "/u/profile"
            ? pathname.startsWith("/u/")
            : pathname === href || (pathname.startsWith(href + "/") && !pathname.startsWith("/recipes/new"))

          if (tab.isAdd) {
            return (
              <Link
                key={tab.href}
                href={href}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-11 h-11 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg -mt-4">
                  <Icon className="text-xl" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0 ${
                isActive ? "text-red-600" : "text-stone-400"
              }`}
            >
              <Icon className="text-lg" />
              <span className="text-[9px] mt-0.5 font-medium leading-tight">{t(tab.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
