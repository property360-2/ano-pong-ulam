"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { MdLock, MdArrowBack, MdDelete, MdEdit, MdRestaurant } from "react-icons/md"
import Header from "@/components/Header"
import { useToast } from "@/lib/toast"

interface RecipeItem {
  id: number
  title: string
  slug: string
  heroImage: string | null
  description: string | null
  author: { username: string }
}

interface CollectionData {
  id: number
  name: string
  emoji: string
  description: string | null
  recipeCount: number
  recipes: RecipeItem[]
}

export default function CollectionDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const { toast } = useToast()
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editEmoji, setEditEmoji] = useState("")

  useEffect(() => {
    if (session) fetchCollection()
  }, [session])

  async function fetchCollection() {
    setLoading(true)
    try {
      const res = await fetch(`/api/collections/${params.id}`)
      if (res.status === 404) {
        toast.error("Collection not found")
        return
      }
      const data = await res.json()
      setCollection(data)
    } catch {
      toast.error("Failed to load collection")
    } finally {
      setLoading(false)
    }
  }

  async function saveChanges() {
    if (!editName.trim()) return
    try {
      const res = await fetch(`/api/collections/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), emoji: editEmoji }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCollection((prev) => prev ? { ...prev, name: updated.name, emoji: updated.emoji } : prev)
        setEditing(false)
        toast.success("Collection updated")
      }
    } catch {
      toast.error("Failed to update")
    }
  }

  async function deleteCollection() {
    if (!confirm("Delete this collection? Recipes inside won't be affected.")) return
    try {
      const res = await fetch(`/api/collections/${params.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Collection deleted")
        window.location.href = "/collections"
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

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-stone-400 text-center py-12">Loading collection...</p>
        </main>
      </>
    )
  }

  if (!collection) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-stone-400 text-center py-12">Collection not found</p>
          <div className="text-center">
            <Link href="/collections" className="text-amber-600 hover:underline">Back to collections</Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/collections"
            className="text-stone-500 hover:text-amber-600 transition-colors"
          >
            <MdArrowBack className="text-xl" />
          </Link>
        </div>

        {editing ? (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                value={editEmoji}
                onChange={(e) => setEditEmoji(e.target.value)}
                maxLength={2}
                className="w-12 text-center text-2xl border border-stone-300 rounded-lg py-1"
              />
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                autoFocus
                className="flex-1 text-2xl font-bold border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveChanges} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Save</button>
              <button onClick={() => setEditing(false)} className="text-stone-500 px-4 py-1.5 rounded-lg text-sm hover:bg-stone-100 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span>{collection.emoji}</span>
              {collection.name}
              <span className="text-base font-normal text-stone-400">({collection.recipeCount} recipe{collection.recipeCount !== 1 ? "s" : ""})</span>
            </h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setEditing(true); setEditName(collection.name); setEditEmoji(collection.emoji) }}
                className="p-2 text-stone-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-stone-100"
                title="Edit"
              >
                <MdEdit />
              </button>
              <button
                onClick={deleteCollection}
                className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg hover:bg-stone-100"
                title="Delete"
              >
                <MdDelete />
              </button>
            </div>
          </div>
        )}

        {collection.recipes.length === 0 ? (
          <div className="text-center py-12">
            <MdRestaurant className="text-5xl text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 mb-4">No recipes in this collection yet</p>
            <Link
              href="/recipes"
              className="text-amber-600 text-sm font-medium hover:underline"
            >
              Browse recipes
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {collection.recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-20 h-20 rounded-xl bg-stone-100 flex-shrink-0 overflow-hidden">
                  {recipe.heroImage ? (
                    <img
                      src={recipe.heroImage}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <MdRestaurant className="text-2xl" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate">{recipe.title}</h3>
                  {recipe.description && (
                    <p className="text-sm text-stone-500 truncate">{recipe.description}</p>
                  )}
                  <p className="text-xs text-stone-400 mt-1">by @{recipe.author.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
