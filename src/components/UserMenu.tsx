/**
 * @file UserMenu.tsx
 * @description Dropdown menu component rendered in the Header for authenticated users.
 * Displays profile overview, links to settings and profile, sign-out actions, and PWA installation trigger.
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { MdPerson, MdSettings, MdLogout, MdArrowDropDown, MdGetApp } from "react-icons/md"
import { usePwa } from "@/hooks/usePwa"
import { useToast } from "@/lib/toast"

/**
 * UserMenu component.
 * Renders the user avatar and dropdown menu for user settings, profile navigation, and app installation.
 * 
 * @returns {JSX.Element | null} The user menu dropdown or null if unauthenticated.
 */
export default function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { installable, triggerInstall } = usePwa()
  const { toast } = useToast()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /**
   * Triggers PWA installation and manages UI feedbacks.
   */
  async function handleInstallApp() {
    setOpen(false)
    const success = await triggerInstall()
    if (success) {
      toast.success("Thank you for installing our app!")
    }
  }

  if (!session?.user) return null

  const avatarUrl = session.user.avatarUrl

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-amber-600 transition-colors min-h-[44px] min-w-[44px]"
        aria-label="User menu"
      >
        {avatarUrl ? (
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt=""
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <span className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center">
            <MdPerson className="text-lg" />
          </span>
        )}
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
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors min-h-[44px]"
          >
            <MdPerson className="text-lg text-stone-400" />
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors min-h-[44px]"
          >
            <MdSettings className="text-lg text-stone-400" />
            Settings
          </Link>

          {installable && (
            <button
              onClick={handleInstallApp}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors min-h-[44px] text-left"
            >
              <MdGetApp className="text-lg text-amber-600" />
              Install App
            </button>
          )}

          <div className="border-t border-stone-100 mt-1 pt-1">
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
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

