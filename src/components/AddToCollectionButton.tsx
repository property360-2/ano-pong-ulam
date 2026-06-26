/**
 * @file AddToCollectionButton.tsx
 * @description Client-side dropdown button allowing users to add/remove a recipe to/from their custom collections.
 * Handles fetching available collections, toggling recipe inclusion, and inline creation of new collections.
 */

"use client"

import { useState, useRef, useEffect, useCallback, useOptimistic, useTransition } from "react"
import { useSession } from "next-auth/react"
import { MdPlaylistAdd, MdCheck, MdAdd } from "react-icons/md"
import { useToast } from "@/lib/toast"

/**
 * AddToCollectionButton component.
 * Renders a playlist add icon button that expands into a dropdown of user collections with inline collection creation.
 * 
 * @param {Object} props Component properties.
 * @param {number} props.recipeId The database ID of the recipe.
 * @returns {JSX.Element} The rendered button and collection manager dropdown.
 */
export default function AddToCollectionButton({ recipeId }: { recipeId: number }) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [collections, setCollections] = useState<Array<{ id: number; name: string; emoji: string; recipeCount: number; hasRecipe: boolean }>>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /**
   * Fetches the user's collections, checking if the current recipe is already part of each.
   */
  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const rid = Number(recipeId)
      const res = await fetch(`/api/collections?checkRecipeId=${rid}`)
      const list = await res.json()
      setCollections(list)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [recipeId])

  useEffect(() => {
    if (open && session) {
      const timer = setTimeout(() => {
        fetchCollections()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, session, fetchCollections])

  /**
   * Toggles the presence of the recipe inside a specific collection.
   * 
   * @param {number} collectionId The collection database ID.
   */
  const [optimisticCollections, addOptimisticCollections] = useOptimistic(
    collections,
    (state, [id, updates]: [number, Partial<{ hasRecipe: boolean; recipeCount: number }>]) =>
      state.map((c) => (c.id === id ? { ...c, ...updates } : c))
  )
  const [, startTransition] = useTransition()

  async function toggleRecipe(collectionId: number) {
    const collection = collections.find((c) => c.id === collectionId)
    if (!collection) return
    const newHasRecipe = !collection.hasRecipe
    const newCount = collection.recipeCount + (newHasRecipe ? 1 : -1)

    startTransition(async () => {
      addOptimisticCollections([collectionId, { hasRecipe: newHasRecipe, recipeCount: newCount }])
      try {
        const res = await fetch(`/api/collections/${collectionId}/recipes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: Number(recipeId) }),
        })
        const data = await res.json()
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId ? { ...c, hasRecipe: data.added, recipeCount: data.recipeCount } : c
          )
        )
        toast.success(data.added ? "Recipe added to collection" : "Recipe removed from collection")
      } catch {
        toast.error("Failed to update collection")
      }
    })
  }

  /**
   * Creates a new collection using the input name and refreshes the collections dropdown list.
   */
  async function createCollection() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (res.ok) {
        const collection = await res.json()
        setNewName("")
        await fetchCollections()
        toast.success(`Created "${collection.name}"`)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create collection")
      }
    } catch {
      toast.error("Failed to create collection")
    } finally {
      setCreating(false)
    }
  }

  if (!session) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors min-h-[44px] px-2.5 rounded-xl hover:bg-stone-50 text-stone-500 hover:text-amber-600"
        title="Add to collection"
      >
        <MdPlaylistAdd className="text-xl" />
        <span>Collect</span>
      </button>

      {open && (
        <div className="absolute z-50 top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-card border border-stone-200 p-3">
          {loading ? (
            <p className="text-sm text-stone-400 text-center py-4">Loading...</p>
          ) : optimisticCollections.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">No collections yet</p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-y-auto mb-3">
              {optimisticCollections.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => toggleRecipe(c.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left transition-colors ${
                      c.hasRecipe
                        ? "bg-amber-50 text-amber-700"
                        : "hover:bg-stone-100 text-stone-700"
                    }`}
                  >
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border border-stone-300">
                      {c.hasRecipe && <MdCheck className="text-amber-600 text-sm" />}
                    </span>
                    <span>{c.emoji}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-stone-400">{c.recipeCount}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2 border-t border-stone-100 pt-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New collection name..."
              maxLength={50}
              className="flex-1 text-sm border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") createCollection()
              }}
            />
            <button
              onClick={createCollection}
              disabled={creating || !newName.trim()}
              className="flex items-center gap-1 text-sm bg-amber-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              <MdAdd />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

