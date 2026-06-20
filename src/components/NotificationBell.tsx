/**
 * @file NotificationBell.tsx
 * @description Notification bell icon and dropdown menu component.
 * Fetches, polls, and displays user notifications (likes, comments, follows, saves).
 * Includes mark-as-read functionality and links to the full notifications list.
 */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MdNotifications, MdNotificationsNone, MdCheck, MdFavorite, MdChat, MdPersonAdd, MdBookmark } from "react-icons/md"
import { useToast } from "@/lib/toast"

type Notification = {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
  actorId: string | null
  targetRecipeId: string | null
}

const typeIcons: Record<string, React.ReactNode> = {
  like: <MdFavorite className="text-red-500" />,
  comment: <MdChat className="text-blue-500" />,
  follow: <MdPersonAdd className="text-green-500" />,
  save: <MdBookmark className="text-amber-500" />,
}

/**
 * Calculates a relative time string (e.g., '5m', '2h', '3d') from a given timestamp.
 * 
 * @param {string} dateStr - The ISO date string to convert.
 * @returns {string} The relative time representation.
 */
function timeAgo(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}

/**
 * NotificationBell component.
 * Renders the header notifications icon showing an unread counter badge.
 * Toggles a dropdown overlay containing recent notifications list.
 * Adjusts dropdown positioning dynamically (fixed overlay on mobile, absolute popup on desktop)
 * to avoid rendering cutoff on narrow viewports.
 * 
 * @returns {JSX.Element | null} The notification trigger button and its conditional dropdown menu, or null if unauthenticated.
 */
export default function NotificationBell() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!session) return
    try {
      const res = await fetch("/api/notifications?tab=unread")
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // silent
    }
  }, [session])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => {
        fetchNotifications()
      }, 0)
      pollingRef.current = setInterval(fetchNotifications, 30000)
      return () => {
        clearTimeout(timer)
        if (pollingRef.current) clearInterval(pollingRef.current)
      }
    }
  }, [session, fetchNotifications])

  useEffect(() => {
    if (open && session) {
      const timer = setTimeout(() => {
        setLoading(true)
        fetch("/api/notifications")
          .then((r) => r.json())
          .then((data) => {
            setNotifications(data.notifications || [])
            setUnreadCount(data.unreadCount || 0)
          })
          .catch(() => {})
          .finally(() => setLoading(false))
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, session])

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  if (!session) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-stone-500 hover:text-amber-600 transition-colors"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <MdNotifications className="text-xl" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </>
        ) : (
          <MdNotificationsNone className="text-xl" />
        )}
      </button>

      {open && (
        <div className="fixed md:absolute z-50 top-16 md:top-full left-4 right-4 md:left-auto md:right-0 mt-2 md:w-80 bg-white rounded-xl shadow-card border border-stone-200 max-h-96 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                >
                  <MdCheck /> Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-stone-400 text-center py-8">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-8">No notifications yet</p>
            ) : (
              <ul>
                {notifications.slice(0, 20).map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.targetRecipeId ? `/recipes/${n.targetRecipeId}` : "#"}
                      onClick={() => {
                        if (!n.isRead) {
                          fetch("/api/notifications", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ notificationId: n.id }),
                          })
                        }
                        setOpen(false)
                      }}
                      className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-stone-50 ${
                        !n.isRead ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {typeIcons[n.type] || <MdNotifications className="text-stone-400" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-700 truncate">{n.message}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-2" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-sm text-amber-600 font-medium py-3 border-t border-stone-100 hover:bg-stone-50 rounded-b-xl transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
