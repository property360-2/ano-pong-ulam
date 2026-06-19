/**
 * @file LikeButton.tsx
 * @description Interactive client-side button enabling authenticated users to like or unlike a recipe.
 * Communicates with the `/api/like` endpoint, updates the local count and state instantly, and triggers toasts.
 */

"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MdFavorite, MdFavoriteBorder } from "react-icons/md"
import { useToast } from "@/lib/toast"

/**
 * LikeButton component.
 * Displays a heart icon with count and handles click events to toggle a recipe like.
 * Redirects unauthenticated users to the login page.
 * 
 * @param {Object} props Component properties.
 * @param {number} props.recipeId The database ID of the recipe.
 * @param {number} [props.initialCount=0] The initial likes count of the recipe.
 * @param {boolean} [props.initialLiked=false] Whether the current user has already liked this recipe.
 * @returns {JSX.Element} The rendered button component.
 */
export default function LikeButton({ recipeId, initialCount = 0, initialLiked = false }: { recipeId: number; initialCount?: number; initialLiked?: boolean }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!session) {
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: Number(recipeId) }),
      })
      const data = await res.json()
      setLiked(data.liked)
      setCount((c) => data.liked ? c + 1 : c - 1)
      toast.success(data.liked ? "Recipe liked!" : "Recipe unliked")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors min-h-[44px] px-2.5 rounded-xl hover:bg-stone-50 ${
        liked ? "text-amber-600" : "text-stone-500 hover:text-amber-600"
      }`}
    >
      <span>{liked ? <MdFavorite /> : <MdFavoriteBorder />}</span>
      <span>{count}</span>
    </button>
  )
}

