/**
 * @file page.tsx
 * @description Collections management page. Allows users to view their custom folders/collections,
 * rename collections, create new ones, and delete collections.
 */

"use client"

import { useState, useEffect, useCallback, useOptimistic, useTransition } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MdLock, MdAdd, MdEdit, MdDelete, MdCollectionsBookmark } from "react-icons/md"
import Header from "@/components/Header"
import PageHeader from "@/components/PageHeader"
import { useToast } from "@/lib/toast"

interface CollectionItem {
  id: number
  name: string
  emoji: string
  recipeCount: number
  createdAt: string
}

/**
 * CollectionsPage component.
 * Renders user's saved collections list, rename inputs, and deletion controls.
 * 
 * @returns {JSX.Element} The rendered collections manager view.
 */
export default function CollectionsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [optimisticCollections, addOptimisticCollections] = useOptimistic(
    collections,
    (state, action: CollectionItem[] | ((prev: CollectionItem[]) => CollectionItem[])) =>
      typeof action === "function" ? action(state) : action
  )
  const [, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")

  /**
   * Fetches user collections from the database.
   * 
   * @returns {Promise<void>} Resolves when state is updated.
   */
  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/collections")
      const data = await res.json()
      setCollections(data)
    } catch {
      toast.error("Failed to load collections")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => {
        fetchCollections()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [session, fetchCollections])

  /**
   * Creates a new collection using the newName state variable.
   * 
   * @returns {Promise<void>} Resolves when the collection is successfully created.
   */
  async function createCollection() {
    if (!newName.trim()) return
    const name = newName.trim()
    const temp: CollectionItem = { id: Date.now(), name, emoji: "📁", recipeCount: 0, createdAt: new Date().toISOString() }

    startTransition(async () => {
      addOptimisticCollections((prev) => [...prev, temp])
      setCreating(true)
      try {
        const res = await fetch("/api/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
        if (res.ok) {
          const c = await res.json()
          setCollections((prev) => [...prev, c])
          setNewName("")
          setShowCreate(false)
          toast.success(`Created "${c.name}"`)
        } else {
          const err = await res.json()
          toast.error(err.error || "Failed to create collection")
        }
      } catch {
        toast.error("Failed to create collection")
      } finally {
        setCreating(false)
      }
    })
  }

  /**
   * Renames an existing collection by sending a PATCH request.
   * 
   * @param {number} id - The ID of the collection to rename.
   * @returns {Promise<void>} Resolves when the rename operation completes.
   */
  async function renameCollection(id: number) {
    if (!editName.trim()) return
    const name = editName.trim()

    startTransition(async () => {
      addOptimisticCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name } : c))
      )
      try {
        const res = await fetch(`/api/collections/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
        if (res.ok) {
          const updated = await res.json()
          setCollections((prev) =>
            prev.map((c) => (c.id === id ? { ...c, name: updated.name } : c))
          )
          setEditingId(null)
          toast.success("Collection renamed")
        }
      } catch {
        toast.error("Failed to rename")
      }
    })
  }

  /**
   * Deletes a collection after user confirmation.
   * 
   * @param {number} id - The ID of the collection to delete.
   * @returns {Promise<void>} Resolves when deletion completes.
   */
  async function deleteCollection(id: number) {
    if (!confirm("Delete this collection? Recipes inside won't be affected.")) return

    startTransition(async () => {
      addOptimisticCollections((prev) => prev.filter((c) => c.id !== id))
      try {
        const res = await fetch(`/api/collections/${id}`, { method: "DELETE" })
        if (res.ok) {
          setCollections((prev) => prev.filter((c) => c.id !== id))
          toast.success("Collection deleted")
        }
      } catch {
        toast.error("Failed to delete")
      }
    })
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4"><MdLock /></span>
          <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
          <Link href="/login" className="text-amber-600 hover:underline">Go to login</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 pt-10 pb-12">
        <PageHeader
          title="My Collections"
          icon={<MdCollectionsBookmark />}
          backHref="/"
        >
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm ml-4"
          >
            <MdAdd /> New Collection
          </button>
        </PageHeader>

        {showCreate && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name..."
              maxLength={50}
              autoFocus
              className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") createCollection()
                if (e.key === "Escape") setShowCreate(false)
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={createCollection}
                disabled={creating || !newName.trim()}
                className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => { setShowCreate(false); setNewName("") }}
                className="text-stone-500 px-4 py-1.5 rounded-lg text-sm hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-stone-400 text-center py-12">Loading collections...</p>
        ) : optimisticCollections.length === 0 ? (
          <div className="text-center py-16">
            <MdCollectionsBookmark className="text-6xl text-stone-200 mx-auto mb-4" />
            <p className="text-stone-500 mb-2">No collections yet</p>
            <p className="text-sm text-stone-400 mb-6">Create a collection to save and organize your favorite recipes.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {collections.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-card-hover transition-shadow"
              >
                {editingId === c.id ? (
                  <div className="flex-1 flex items-center gap-2 mr-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={50}
                      autoFocus
                      className="flex-1 border border-stone-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameCollection(c.id)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                    />
                    <button onClick={() => renameCollection(c.id)} className="text-sm text-amber-600 font-medium hover:underline">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-stone-400 hover:underline">Cancel</button>
                  </div>
                ) : (
                  <Link
                    href={`/collections/${c.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.name}</p>
                      <p className="text-sm text-stone-400">{c.recipeCount} recipe{c.recipeCount !== 1 ? "s" : ""}</p>
                    </div>
                  </Link>
                )}

                {editingId !== c.id && (
                  <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(c.id); setEditName(c.name) }}
                      className="p-2 text-stone-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-stone-100"
                      title="Rename"
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={() => deleteCollection(c.id)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-stone-100"
                      title="Delete"
                    >
                      <MdDelete />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
