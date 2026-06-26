"use client"

import { useState, useOptimistic, useTransition } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast"

export default function FollowButton({ targetUserId, initialFollowing = false, username }: { targetUserId: string; initialFollowing?: boolean; username?: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [following, setFollowing] = useState(initialFollowing)
  const [optimisticFollowing, addOptimisticFollowing] = useOptimistic(following, (_, next: boolean) => next)
  const [isPending, startTransition] = useTransition()

  async function handleClick() {
    if (!session) {
      router.push("/login")
      return
    }
    startTransition(async () => {
      addOptimisticFollowing(!optimisticFollowing)
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
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`text-sm font-medium px-4 py-1.5 rounded-lg border transition-colors ${
        optimisticFollowing
          ? "border-stone-300 text-stone-600 hover:border-red-300 hover:text-amber-600"
          : "bg-red-600 text-white border-red-600 hover:bg-red-700"
      }${isPending ? " opacity-60" : ""}`}
    >
      {optimisticFollowing ? "Following" : "Follow"}
    </button>
  )
}
