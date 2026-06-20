/**
 * @file page.tsx
 * @description Admin page for managing user feedback. Retrieves all entries from /api/feedback
 * and allows filtering and deletion. Restricts view to the admin user, displaying an Access Denied
 * screen for unauthorized accounts. Fits into the broader system as the feedback dashboard.
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { MdDelete, MdFilterList, MdLock, MdFeedback, MdPerson } from "react-icons/md"
import { useToast } from "@/lib/toast"

interface FeedbackUser {
  username: string
  displayName: string | null
  avatarUrl: string | null
}

interface FeedbackEntry {
  id: string
  userId: string | null
  category: string
  message: string
  createdAt: string
  user?: FeedbackUser | null
}

/**
 * FeedbackListPage component.
 * Renders the feedback management dashboard.
 * Secures access by verifying the API response and renders an Access Denied view on 403/401 errors.
 * Includes search/filter categories, deletion handlers, and empty/loading states.
 * 
 * @returns {JSX.Element} The rendered Feedback List manager page.
 */
export default function FeedbackListPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>("all")

  // Load feedbacks on component mount or session status change
  useEffect(() => {
    if (status === "loading") return

    async function fetchFeedbacks() {
      try {
        const response = await fetch("/api/feedback", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401 || response.status === 403) {
          setAuthorized(false)
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error("Failed to load feedbacks.")
        }

        const data = await response.json()
        setFeedbacks(data)
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Error loading feedbacks."
        toast.error(errMsg)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbacks()
  }, [status, toast])

  /**
   * Triggers deletion of a feedback entry.
   * Prompts for confirmation and deletes via DELETE /api/feedback.
   * 
   * @param {string} id The unique identifier of the feedback to delete.
   */
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this feedback entry?")) {
      return
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete entry.")
      }

      setFeedbacks((prev) => prev.filter((item) => item.id !== id))
      toast.success("Feedback entry deleted.")
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error deleting entry."
      toast.error(errMsg)
    }
  }

  // Helper function to format ISO date to readable string
  function formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  // Helper to map category slugs to user-friendly titles
  function getCategoryLabel(slug: string): string {
    switch (slug) {
      case "bug":
        return "Bug Report"
      case "feature":
        return "Feature Request"
      case "recipe":
        return "Recipe Suggestion"
      default:
        return "General Feedback"
    }
  }

  // Helper to map category colors
  function getCategoryColors(slug: string): string {
    switch (slug) {
      case "bug":
        return "bg-red-50 text-red-700 border-red-200"
      case "feature":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "recipe":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-stone-50 text-stone-700 border-stone-200"
    }
  }

  // Filter feedbacks locally based on active selection
  const filteredFeedbacks = feedbacks.filter((item) => {
    if (activeFilter === "all") return true
    return item.category === activeFilter
  })

  // Render Skeleton view during authentication query
  if (status === "loading" || loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-stone-50 py-12 px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-10 w-48 bg-stone-200 animate-pulse rounded-xl" />
          <div className="h-12 w-full bg-stone-200 animate-pulse rounded-xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-stone-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  // Access Denied template
  if (!authorized) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-stone-50 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <MdLock className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Kusina Rules: Access Denied</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Only the head chef is allowed in this section of the kitchen.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-red-600 text-white hover:bg-red-700 py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm min-h-[44px]"
          >
            Return to Home
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-stone-50 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <MdFeedback className="text-red-600" />
              Feedback Manager
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Showing {filteredFeedbacks.length} of {feedbacks.length} total entries.
            </p>
          </div>

          {/* Categories Filters bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-stone-400 text-xs font-semibold uppercase mr-1 flex items-center gap-1">
              <MdFilterList /> Filter:
            </span>
            {[
              { slug: "all", label: "All" },
              { slug: "bug", label: "Bugs" },
              { slug: "feature", label: "Features" },
              { slug: "recipe", label: "Recipes" },
              { slug: "other", label: "Others" },
            ].map((filter) => (
              <button
                key={filter.slug}
                onClick={() => setActiveFilter(filter.slug)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors whitespace-nowrap min-h-[32px] ${
                  activeFilter === filter.slug
                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedbacks Listing Grid */}
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-stone-400 text-sm font-medium">No feedbacks found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Delete Entry Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete feedback"
                  className="absolute top-4 right-4 text-stone-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-stone-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <MdDelete className="text-xl" />
                </button>

                {/* Card Header Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getCategoryColors(
                      item.category
                    )}`}
                  >
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-xs text-stone-400">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Message Box */}
                <div className="text-stone-700 text-sm leading-relaxed mb-4 pr-12 whitespace-pre-wrap">
                  {item.message}
                </div>

                {/* Submitter User Details footer */}
                <div className="flex items-center gap-2.5 pt-4 border-t border-stone-100">
                  {item.user ? (
                    <Link
                      href={`/u/${item.user.username}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      {item.user.avatarUrl ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden relative">
                          <Image
                            src={item.user.avatarUrl}
                            alt=""
                            width={24}
                            height={24}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                          <MdPerson className="text-sm" />
                        </span>
                      )}
                      <span className="text-xs font-semibold text-stone-700">
                        {item.user.displayName || item.user.username}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        (@{item.user.username})
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                        <MdPerson className="text-sm" />
                      </span>
                      <span className="text-xs font-semibold text-stone-400 italic">
                        Guest Cook
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
