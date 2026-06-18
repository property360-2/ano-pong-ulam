"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MdFavorite, MdFavoriteBorder } from "react-icons/md"

export default function LikeButton({ recipeId, initialCount = 0, initialLiked = false }: { recipeId: bigint | number; initialCount?: number; initialLiked?: boolean }) {
  const { data: session } = useSession()
  const router = useRouter()
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
    } catch {
      // revert on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
        liked ? "text-amber-600" : "text-stone-500 hover:text-amber-600"
      }`}
    >
      <span>{liked ? <MdFavorite /> : <MdFavoriteBorder />}</span>
      <span>{count}</span>
    </button>
  )
}
