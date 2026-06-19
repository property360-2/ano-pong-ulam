"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MdRssFeed, MdMenuBook, MdAdd, MdCalendarMonth, MdPerson } from "react-icons/md"
import { useSession } from "next-auth/react"
import type { IconType } from "react-icons"

type Tab = {
  href: string
  label: string
  icon: IconType
  isAdd?: boolean
}

const TABS: Tab[] = [
  { href: "/feed", label: "Feed", icon: MdRssFeed },
  { href: "/recipes", label: "Recipes", icon: MdMenuBook },
  { href: "/recipes/new", label: "Share", icon: MdAdd, isAdd: true },
  { href: "/meal-planner", label: "Planner", icon: MdCalendarMonth },
  { href: "/u/profile", label: "Profile", icon: MdPerson },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session?.user) return null

  const profileHref = `/u/${session.user.name}`

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const href = tab.href === "/u/profile" ? profileHref : tab.href
          const isActive = tab.href === "/u/profile"
            ? pathname.startsWith("/u/")
            : pathname === href || pathname.startsWith(href + "/")

          if (tab.isAdd) {
            return (
              <Link
                key={tab.href}
                href={href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Icon className="text-2xl" />
                </div>
                <span className="text-[10px] mt-1 font-medium text-stone-500">{tab.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={tab.href}
              href={href}
              className={`flex flex-col items-center justify-center min-w-[60px] py-1 ${
                isActive ? "text-red-600" : "text-stone-400"
              }`}
            >
              <Icon className="text-xl" />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
