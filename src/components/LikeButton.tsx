/**
 * @file LikeButton.tsx
 * @description Interactive client-side button enabling authenticated users to like or unlike a recipe.
 * Communicates with the `/api/like` endpoint, updates the local count and state instantly, and triggers toasts.
 */

"use client"

import { useState, useOptimistic, useTransition } from "react"
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
  const [optimisticLiked, addOptimisticLiked] = useOptimistic(liked, (_, next: boolean) => next)
  const [optimisticCount, addOptimisticCount] = useOptimistic(count, (_, next: number) => next)
  const [isPending, startTransition] = useTransition()

  async function handleClick() {
    if (!session) {
      router.push("/login")
      return
    }
    startTransition(async () => {
      addOptimisticLiked(!optimisticLiked)
      addOptimisticCount(optimisticCount + (optimisticLiked ? -1 : 1))
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
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors min-h-[44px] px-2.5 rounded-xl hover:bg-stone-50 ${
        optimisticLiked ? "text-amber-600" : "text-stone-500 hover:text-amber-600"
      }${isPending ? " opacity-60" : ""}`}
    >
      <span>{optimisticLiked ? <MdFavorite /> : <MdFavoriteBorder />}</span>
      <span>{optimisticCount}</span>
    </button>
  )
}

