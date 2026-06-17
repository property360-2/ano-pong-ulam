"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function CommentForm({ recipeId }: { recipeId: bigint | number }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !session) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: Number(recipeId), content }),
      })
      if (res.ok) {
        setContent("")
        router.refresh()
      }
    } catch {
      // error
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) return null

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        maxLength={500}
        className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        Post
      </button>
    </form>
  )
}
