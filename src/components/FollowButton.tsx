"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast"

export default function FollowButton({ targetUserId, initialFollowing = false, username }: { targetUserId: string; initialFollowing?: boolean; username?: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!session) {
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      })
      const data = await res.json()
      setFollowing(data.following)
      toast.success(data.following ? `Followed ${username || "user"}` : `Unfollowed ${username || "user"}`)
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
      className={`text-sm font-medium px-4 py-1.5 rounded-lg border transition-colors ${
        following
          ? "border-stone-300 text-stone-600 hover:border-red-300 hover:text-amber-600"
          : "bg-red-600 text-white border-red-600 hover:bg-red-700"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  )
}
