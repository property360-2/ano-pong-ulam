"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { MdPerson, MdSettings, MdLogout, MdArrowDropDown, MdRestaurant } from "react-icons/md"

export default function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session?.user) return null

  const initial = (session.user.name || "U")[0].toUpperCase()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-amber-600 transition-colors"
      >
        <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">
          {initial}
        </span>
        <MdArrowDropDown className={`text-lg transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-card border border-stone-200 py-1.5">
          <div className="px-4 py-2 border-b border-stone-100">
            <p className="text-sm font-medium truncate">{session.user.name}</p>
            <p className="text-xs text-stone-400 truncate">{session.user.email}</p>
          </div>

          <Link
            href={`/u/${session.user.name}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <MdPerson className="text-lg text-stone-400" />
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <MdSettings className="text-lg text-stone-400" />
            Settings
          </Link>

          <div className="border-t border-stone-100 mt-1 pt-1">
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <MdLogout className="text-lg" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
