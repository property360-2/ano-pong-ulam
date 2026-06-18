"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MdLock, MdAdd, MdEdit, MdDelete, MdArrowBack, MdCollectionsBookmark } from "react-icons/md"
import Header from "@/components/Header"
import { useToast } from "@/lib/toast"

interface CollectionItem {
  id: number
  name: string
  emoji: string
  recipeCount: number
  createdAt: string
}

export default function CollectionsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    if (session) fetchCollections()
  }, [session])

  async function fetchCollections() {
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
  }

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
        const c = await res.json()
        setCollections((prev) => [...prev, c])
        setNewName("")
        setShowCreate(false)
        toast.success(`Created "${c.name}"`)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create")
      }
    } catch {
      toast.error("Failed to create collection")
    } finally {
      setCreating(false)
    }
  }

  async function renameCollection(id: number) {
    if (!editName.trim()) return
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
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
  }

  async function deleteCollection(id: number) {
    if (!confirm("Delete this collection? Recipes inside won't be affected.")) return
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" })
      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id))
        toast.success("Collection deleted")
      }
    } catch {
      toast.error("Failed to delete")
    }
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-stone-500 hover:text-amber-600 transition-colors"
            >
              <MdArrowBack className="text-xl" />
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MdCollectionsBookmark className="text-amber-600" />
              My Collections
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            <MdAdd /> New Collection
          </button>
        </div>

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
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-400 mb-4">No collections yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-amber-600 text-sm font-medium hover:underline"
            >
              Create your first collection
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {collections.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-4 hover:shadow-card-hover transition-shadow"
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
                    className="flex-1 flex items-center gap-3 min-w-0"
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.name}</p>
                      <p className="text-sm text-stone-400">{c.recipeCount} recipe{c.recipeCount !== 1 ? "s" : ""}</p>
                    </div>
                  </Link>
                )}

                {editingId !== c.id && (
                  <div className="flex items-center gap-1">
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
