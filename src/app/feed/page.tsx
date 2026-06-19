/**
 * @file page.tsx
 * @description Highly visual, story-inspired social feed component. Displays popular community recipes
 * in a space-saving horizontal card row. Feed items are designed visual-first, featuring large recipe image backgrounds
 * overlaid with the active user's avatar, social action status, and star ratings. Emoji icons are replaced with clean
 * Material Design vector icons.
 */

"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { 
  MdFavorite, 
  MdComment, 
  MdPersonAdd, 
  MdRssFeed, 
  MdStar, 
  MdLocalFireDepartment, 
  MdArrowForward,
  MdRestaurantMenu,
  MdClose
} from "react-icons/md"
import Header from "@/components/Header"

interface FeedUser {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

interface FeedRecipe {
  slug: string
  title: string
  heroImage: string | null
  category?: string
  difficulty?: string
  _count?: { likes: number }
}

interface FeedActivity {
  id: string
  userId: string
  type: string
  targetRecipeId: string | null
  targetUserId: string | null
  createdAt: string
  recipe: FeedRecipe | null
  user: FeedUser | null
  targetUser: FeedUser | null
}

/**
 * FeedPage component.
 * Main social feed view. Renders the horizontal highlights bar and the visual-first feed activity list.
 * 
 * @returns {JSX.Element} The rendered visual-first social feed structure.
 */
export default function FeedPage() {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<FeedActivity[]>([])
  const [trending, setTrending] = useState<FeedRecipe[]>([])
  const [tab, setTab] = useState<"global" | "following">("global")
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  /**
   * Fetches popular recipes for the top horizontal highlights container.
   */
  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch("/api/recipes?sort=popular&limit=6")
      if (res.ok) {
        const data = await res.json()
        setTrending(data.recipes || [])
      }
    } catch (err) {
      console.error("Failed to load trending recipes:", err)
    }
  }, [])

  /**
   * Fetches activities list.
   * 
   * @param {string | null} nextCursor Pagination cursor identifier.
   * @param {boolean} isLoadMore Whether to append results to current list.
   */
  const fetchFeed = useCallback(async (nextCursor: string | null = null, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      const url = new URL("/api/feed", window.location.origin)
      url.searchParams.set("tab", tab)
      if (nextCursor) {
        url.searchParams.set("cursor", nextCursor)
      }

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch feed")
      
      const data = await res.json()
      
      if (isLoadMore) {
        setActivities((prev) => [...prev, ...data.activities])
      } else {
        setActivities(data.activities)
      }

      setCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch (err) {
      console.error("Feed error:", err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [tab])

  useEffect(() => {
    fetchTrending()
  }, [fetchTrending])

  useEffect(() => {
    fetchFeed(null, false)
  }, [tab, fetchFeed])

  /**
   * Loads more activities.
   */
  function handleLoadMore() {
    if (cursor && !loadingMore) {
      fetchFeed(cursor, true)
    }
  }

  /**
   * Formats event timestamps into relative words.
   */
  function formatRelativeTime(dateString: string): string {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
        <div className="text-center bg-white border border-stone-200 p-8 rounded-2xl max-w-sm shadow-card">
          <span className="text-5xl text-amber-600 block mb-4">
            <MdRssFeed className="mx-auto" />
          </span>
          <h1 className="text-xl font-bold mb-2">Sign in to view your feed</h1>
          <p className="text-stone-500 text-sm mb-6">
            Follow other home cooks, discover what recipes are trending, and see cooking reviews in real-time.
          </p>
          <Link
            href="/login"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col animate-fade-in">
      <Header />
      
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-6">
        
        {/* Compact Story-Style Horizontal Scroll Highlights */}
        {trending.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-1 mb-2 text-stone-700">
              <MdLocalFireDepartment className="text-amber-500 text-lg animate-pulse" />
              <h2 className="font-extrabold text-[11px] uppercase tracking-wider">Trending Highlights</h2>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x">
              {trending.map((recipe) => (
                <Link 
                  key={recipe.slug} 
                  href={`/recipes/${recipe.slug}`}
                  className="flex-shrink-0 w-36 h-24 relative bg-stone-900 rounded-xl overflow-hidden hover:opacity-90 snap-start shadow-sm border border-stone-200/10"
                >
                  {recipe.heroImage ? (
                    <Image
                      src={recipe.heroImage}
                      alt={recipe.title}
                      fill
                      sizes="150px"
                      className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-200 bg-gradient-to-br from-red-800 to-red-950">
                      <MdRestaurantMenu className="text-2xl" />
                    </div>
                  )}
                  {/* Subtle Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Recipe Name Overlay */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[11px] font-extrabold text-white line-clamp-2 leading-tight">
                      {recipe.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 mb-5 gap-6">
          <button
            onClick={() => setTab("global")}
            className={`pb-2.5 text-xs font-extrabold transition-all relative uppercase tracking-wider ${
              tab === "global" ? "text-red-600" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            Global Activity
            {tab === "global" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab("following")}
            className={`pb-2.5 text-xs font-extrabold transition-all relative uppercase tracking-wider ${
              tab === "following" ? "text-red-600" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            Following Feed
            {tab === "following" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-full h-64 bg-stone-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-6">
            <span className="text-4xl block mb-3 text-stone-400">
              <MdRestaurantMenu className="mx-auto text-3xl" />
            </span>
            <h3 className="font-bold text-stone-850 text-base">No updates yet</h3>
            <p className="text-stone-500 text-xs max-w-xs mx-auto mt-1 leading-relaxed">
              {tab === "following" 
                ? "Follow other home cooks or explore recipes to start seeing posts."
                : "No activities registered yet. Start liking and commenting on recipes!"}
            </p>
            {tab === "following" && (
              <Link
                href="/recipes"
                className="mt-4 inline-block text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 px-5 py-2.5 rounded-xl transition-colors"
              >
                Browse Recipes
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {activities.map((activity) => {
              const actUser = activity.user
              const displayName = actUser?.displayName || actUser?.username || "Someone"
              const userAvatarLetter = displayName[0]?.toUpperCase()

              // Follow Activity View
              if (activity.type === "follow" && activity.targetUser) {
                return (
                  <div 
                    key={activity.id} 
                    className="bg-white rounded-2xl p-4 border border-stone-200 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {/* Actor Avatar */}
                      <Link href={`/u/${actUser?.username || ""}`}>
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 overflow-hidden relative border border-amber-200">
                          {actUser?.avatarUrl ? (
                            <Image src={actUser.avatarUrl} alt="" fill sizes="36px" className="object-cover" />
                          ) : (
                            userAvatarLetter
                          )}
                        </div>
                      </Link>
                      
                      <div className="text-xs">
                        <p className="text-stone-700">
                          <Link href={`/u/${actUser?.username || ""}`} className="font-extrabold hover:underline">
                            {displayName}
                          </Link>{" "}
                          followed{" "}
                          <Link href={`/u/${activity.targetUser.username}`} className="font-extrabold text-blue-650 hover:underline">
                            @{activity.targetUser.username}
                          </Link>
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">{formatRelativeTime(activity.createdAt)}</p>
                      </div>
                    </div>
                    
                    <Link
                      href={`/u/${activity.targetUser.username}`}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-0.5"
                    >
                      Profile <MdArrowForward />
                    </Link>
                  </div>
                )
              }

              // Visual-First Recipe Activities (Like, Comment)
              if (activity.recipe) {
                return (
                  <Link key={activity.id} href={`/recipes/${activity.recipe.slug}`}>
                    <div className="group relative w-full h-64 rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-card hover:border-amber-300/40 transition-all cursor-pointer flex flex-col justify-between">
                      
                      {/* Absolute Background Image (Visual-First) */}
                      {activity.recipe.heroImage ? (
                        <Image
                          src={activity.recipe.heroImage}
                          alt={activity.recipe.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 512px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-900 to-stone-950" />
                      )}

                      {/* Top Overlay (Gradient to hide text cleanly) */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85 z-10" />

                      {/* Top Bar Contents: Actor Circle Avatar + Action Summary */}
                      <div className="relative z-20 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white overflow-hidden relative border border-white/30">
                            {actUser?.avatarUrl ? (
                              <Image src={actUser.avatarUrl} alt="" fill sizes="32px" className="object-cover" />
                            ) : (
                              userAvatarLetter
                            )}
                          </div>
                          <div className="text-white text-xs font-semibold shadow-sm">
                            <span className="font-extrabold">{displayName}</span>
                            <span className="opacity-80">
                              {activity.type === "like" ? " recommended this" : " reviewed this"}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-white/70 font-semibold">{formatRelativeTime(activity.createdAt)}</span>
                      </div>

                      {/* Bottom Bar Contents: Title, Category, Rating, and Sleek CTA overlay */}
                      <div className="relative z-20 p-4 flex items-end justify-between">
                        <div className="min-w-0 mr-3">
                          <span className="text-[9px] uppercase font-black text-white bg-red-600 px-2 py-0.5 rounded tracking-wider shadow-sm self-start">
                            {activity.recipe.category || "ulam"}
                          </span>
                          <h3 className="font-black text-white text-lg leading-tight mt-1.5 drop-shadow-md truncate">
                            {activity.recipe.title}
                          </h3>
                          
                          {/* Like count badge */}
                          <div className="flex items-center gap-1 mt-1">
                            <MdFavorite className="text-sm text-red-400 drop-shadow-md" />
                            <span className="text-xs text-white/80 font-semibold">
                              {activity.recipe._count?.likes ?? 0} likes
                            </span>
                          </div>
                        </div>

                        {/* Minimal Click Target Overlay Button */}
                        <div className="bg-white hover:bg-amber-50 text-stone-900 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1 shadow-md transition-colors flex-shrink-0">
                          View Recipe <MdArrowForward className="text-xs" />
                        </div>
                      </div>

                    </div>
                  </Link>
                )
              }

              return null
            })}

            {/* Pagination Load More */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full text-center bg-white hover:bg-stone-50 border border-stone-200 py-3.5 rounded-xl font-extrabold text-xs text-stone-700 transition-all disabled:opacity-50 shadow-sm"
              >
                {loadingMore ? "Loading more stories..." : "Show More Activities"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
