"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MdLock, MdArrowBack, MdCheck, MdFavorite, MdChat, MdPersonAdd, MdBookmark, MdNotifications } from "react-icons/md"
import Header from "@/components/Header"
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

function timeAgo(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (session) fetchNotifications()
  }, [session, tab])

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?tab=${tab}`)
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Failed to mark as read")
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4"><MdLock /></span>
          <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
          <Link href="/login" className="text-amber-600 hover:underline">Go to login</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-stone-500 hover:text-amber-600 transition-colors"
            >
              <MdArrowBack className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MdNotifications className="text-amber-600" />
              Notifications
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-sm text-amber-600 hover:underline"
            >
              <MdCheck /> Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "all" ? "bg-white shadow-sm text-stone-800" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("unread")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === "unread" ? "bg-white shadow-sm text-stone-800" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {loading ? (
          <p className="text-stone-400 text-center py-12">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <MdNotifications className="text-5xl text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400">
              {tab === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-xs text-stone-300 mt-1">
              When someone likes, comments, or follows you, it'll show up here
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.targetRecipeId ? `/recipes/${n.targetRecipeId}` : "#"}
                  onClick={() => {
                    if (!n.isRead) {
                      fetch("/api/notifications", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ notificationId: n.id }),
                      }).then(() => {
                        setNotifications((prev) =>
                          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
                        )
                      })
                    }
                  }}
                  className={`flex items-start gap-4 px-4 py-4 rounded-2xl transition-colors ${
                    !n.isRead
                      ? "bg-amber-50 border border-amber-100"
                      : "hover:bg-stone-50 border border-transparent"
                  }`}
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-lg">
                    {typeIcons[n.type] || <MdNotifications className="text-stone-400" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700">{n.message}</p>
                    <p className="text-xs text-stone-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <span className="flex-shrink-0 w-2.5 h-2.5 bg-amber-500 rounded-full mt-2" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
