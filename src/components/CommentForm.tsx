/**
 * @file CommentForm.tsx
 * @description Interactive comment submission form for authenticated users.
 * Submits comment contents to `/api/comment` and triggers page refresh and notifications.
 */

"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast"

/**
 * CommentForm component.
 * Renders a simple comment input field and submit button.
 * Only renders if the user session is active.
 * 
 * @param {Object} props Component properties.
 * @param {number} props.recipeId The database ID of the recipe.
 * @returns {JSX.Element | null} The comment form interface or null if unauthenticated.
 */
export default function CommentForm({ recipeId }: { recipeId: number }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
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
        toast.success("Comment posted!")
      } else {
        toast.error("Failed to post comment")
      }
    } catch {
      toast.error("Something went wrong")
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
        className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:bg-stone-100 disabled:text-stone-400 disabled:border-stone-200 border border-transparent transition-all"
      >
        Post
      </button>
    </form>
  )
}

