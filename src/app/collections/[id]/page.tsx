"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { MdLock, MdArrowBack, MdDelete, MdEdit, MdRestaurant } from "react-icons/md"
import Header from "@/components/Header"
import PageHeader from "@/components/PageHeader"
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
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCollection((prev) => prev ? { ...prev, name: updated.name } : prev)
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
      <main className="max-w-4xl mx-auto px-4 pt-10 pb-12">
        {editing ? (
          <>
            <div className="mb-6">
              <Link
                href="/collections"
                className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 transition-colors"
              >
                <MdArrowBack className="text-lg" />
                Back to Collections
              </Link>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="mb-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                  autoFocus
                  className="w-full text-lg font-bold border border-stone-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={saveChanges} className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Save</button>
                <button onClick={() => setEditing(false)} className="text-stone-500 px-4 py-1.5 rounded-lg text-sm hover:bg-stone-100 transition-colors">Cancel</button>
              </div>
            </div>
          </>
        ) : (
          <PageHeader
            title={
              <span className="flex items-center gap-3">
                <span>{collection.name}</span>
                <span className="text-base font-normal text-stone-400">({collection.recipeCount} recipe{collection.recipeCount !== 1 ? "s" : ""})</span>
              </span>
            }
            backHref="/collections"
          >
            <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setEditing(true); setEditName(collection.name) }}
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
          </PageHeader>
        )}

        {collection.recipes.length === 0 ? (
          <div className="text-center py-16">
            <MdRestaurant className="text-6xl text-stone-200 mx-auto mb-4" />
            <p className="text-stone-500 mb-2">This collection is empty</p>
            <p className="text-sm text-stone-400 mb-6">Browse recipes and save your favorites to this collection.</p>
            <Link
              href="/recipes"
              className="inline-block bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Browse Recipes
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
                    <Image
                      src={recipe.heroImage}
                      alt={recipe.title}
                      width={80}
                      height={80}
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
