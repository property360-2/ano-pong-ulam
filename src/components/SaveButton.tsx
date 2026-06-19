/**
 * @file SaveButton.tsx
 * @description Interactive client-side button enabling authenticated users to save/bookmark a recipe.
 * Communicates with the `/api/save` endpoint, updates the local bookmark state, and triggers toast notifications.
 */

"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MdBookmark, MdBookmarkBorder } from "react-icons/md"
import { useToast } from "@/lib/toast"

/**
 * SaveButton component.
 * Displays a bookmark icon and handles click events to save/bookmark a recipe.
 * Redirects unauthenticated users to the login page.
 * 
 * @param {Object} props Component properties.
 * @param {number} props.recipeId The database ID of the recipe.
 * @param {boolean} [props.initialSaved=false] Whether the current user has already saved this recipe.
 * @returns {JSX.Element} The rendered button component.
 */
export default function SaveButton({ recipeId, initialSaved = false }: { recipeId: number; initialSaved?: boolean }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!session) {
      router.push("/login")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: Number(recipeId) }),
      })
      const data = await res.json()
      setSaved(data.saved)
      toast.success(data.saved ? "Recipe saved!" : "Recipe removed from saves")
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
        saved ? "text-amber-600" : "text-stone-500 hover:text-amber-600"
      }`}
    >
      <span>{saved ? <MdBookmark /> : <MdBookmarkBorder />}</span>
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  )
}

