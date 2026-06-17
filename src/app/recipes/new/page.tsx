"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { MdLock, MdRestaurant, MdClose, MdLightbulb } from "react-icons/md"

interface Ingredient {
  name: string
  amount: string
  unit: string
  notes: string
}

interface Step {
  instruction: string
  tips: string
}

export default function NewRecipePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "", notes: "" },
  ])
  const [steps, setSteps] = useState<Step[]>([{ instruction: "", tips: "" }])
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4"><MdLock /></span>
          <h1 className="text-xl font-bold mb-2">Sign in to share a recipe</h1>
          <p className="text-stone-500 mb-6">
            You need an account to share recipes with the community.
          </p>
          <Link
            href="/login"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: "", amount: "", unit: "", notes: "" }])
  }

  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    const updated = [...ingredients]
    updated[i] = { ...updated[i], [field]: value }
    setIngredients(updated)
  }

  function removeIngredient(i: number) {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, idx) => idx !== i))
    }
  }

  function addStep() {
    setSteps([...steps, { instruction: "", tips: "" }])
  }

  function updateStep(i: number, field: keyof Step, value: string) {
    const updated = [...steps]
    updated[i] = { ...updated[i], [field]: value }
    setSteps(updated)
  }

  function removeStep(i: number) {
    if (steps.length > 1) {
      setSteps(steps.filter((_, idx) => idx !== i))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // NOTE: Save the form reference BEFORE any async call — React nulls out e.currentTarget after the handler returns
    const form = e.currentTarget
    setSubmitting(true)
    setUploading(true)
    setError("")

    try {
      let heroImage = ""

      // NOTE: Upload hero image first if the user selected one
      if (heroFile) {
        const uploadForm = new FormData()
        uploadForm.set("file", heroFile)
        uploadForm.set("folder", "recipe-images")

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        })

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json()
          throw new Error(uploadErr.error || "Failed to upload image")
        }

        const { url } = await uploadRes.json()
        heroImage = url
      }

      const formData = new FormData(form)

      const data = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        story: formData.get("story") as string,
        category: formData.get("category") as string,
        region: formData.get("region") as string,
        difficulty: formData.get("difficulty") as string,
        prepTime: parseInt(formData.get("prepTime") as string) || 0,
        cookTime: parseInt(formData.get("cookTime") as string) || 0,
        servings: parseInt(formData.get("servings") as string) || 4,
        heroImage,
        ingredients: ingredients.filter((i) => i.name && i.amount),
        steps: steps
          .filter((s) => s.instruction)
          .map((s, idx) => ({ number: idx + 1, instruction: s.instruction, tips: s.tips || undefined })),
        tags: (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean),
      }

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create recipe")
      }

      const recipe = await res.json()
      router.push(`/recipes/${recipe.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-3xl px-4 h-16 flex items-center">
          <Link href="/" className="font-bold text-lg inline-flex items-center gap-1">
            <MdRestaurant /> Ano Pong <span className="text-red-600">Ulam?</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Share a Recipe</h1>
        <p className="text-stone-500 mb-8">
          Share your family recipe with the community — every lola&apos;s recipe deserves to be preserved.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-lg font-bold">Basic Info</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">Recipe Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g., Sinigang na Baboy"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Short Description</label>
              <textarea
                id="description"
                name="description"
                rows={2}
                placeholder="A comforting sour soup perfect for rainy days..."
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label htmlFor="heroImage" className="block text-sm font-medium mb-1">Hero Image</label>
              <input
                id="heroImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
              <p className="text-xs text-stone-400 mt-1">Optional. Max 5MB. JPEG, PNG, WebP, or GIF.</p>
            </div>

            <div>
              <label htmlFor="story" className="block text-sm font-medium mb-1">The Story Behind This Recipe</label>
              <textarea
                id="story"
                name="story"
                rows={3}
                placeholder="Lola Maria's original recipe from 1960s Batangas..."
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">Category *</label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select...</option>
                  <option value="ulam">Ulam</option>
                  <option value="merienda">Merienda</option>
                  <option value="breakfast">Pang-almusal</option>
                  <option value="fiesta">Pampasko / Fiesta</option>
                  <option value="vegetable">Lutong Gulay</option>
                  <option value="dessert">Dessert</option>
                  <option value="soup">Soup / Sabaw</option>
                  <option value="rice">Rice / Kanin</option>
                </select>
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium mb-1">Region</label>
                <select
                  id="region"
                  name="region"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Any region</option>
                  <option value="tagalog">Tagalog</option>
                  <option value="bicol">Bicol</option>
                  <option value="ilocano">Ilocano</option>
                  <option value="kapampangan">Kapampangan</option>
                  <option value="visayas">Visayas</option>
                  <option value="mindanao">Mindanao</option>
                  <option value="diaspora">Diaspora / International</option>
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label htmlFor="servings" className="block text-sm font-medium mb-1">Servings</label>
                <input
                  id="servings"
                  name="servings"
                  type="number"
                  min={1}
                  defaultValue={4}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prepTime" className="block text-sm font-medium mb-1">Prep Time (minutes)</label>
                <input
                  id="prepTime"
                  name="prepTime"
                  type="number"
                  min={0}
                  placeholder="15"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label htmlFor="cookTime" className="block text-sm font-medium mb-1">Cook Time (minutes)</label>
                <input
                  id="cookTime"
                  name="cookTime"
                  type="number"
                  min={0}
                  placeholder="45"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags</label>
              <input
                id="tags"
                name="tags"
                type="text"
                placeholder="budget, lenten, freezer-friendly, kids-love-it (comma separated)"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Ingredients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm text-red-600 font-medium hover:text-red-700"
              >
                + Add Ingredient
              </button>
            </div>

            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Amount"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                    className="col-span-2 border border-stone-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                    className="col-span-2 border border-stone-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, "name", e.target.value)}
                    className="col-span-5 border border-stone-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={ing.notes}
                    onChange={(e) => updateIngredient(i, "notes", e.target.value)}
                    className="col-span-3 border border-stone-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="text-stone-400 hover:text-red-600 mt-2"
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            ))}
          </section>

          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Instructions</h2>
              <button
                type="button"
                onClick={addStep}
                className="text-sm text-red-600 font-medium hover:text-red-700"
              >
                + Add Step
              </button>
            </div>

            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <textarea
                    placeholder="Describe this step..."
                    value={step.instruction}
                    onChange={(e) => updateStep(i, "instruction", e.target.value)}
                    rows={2}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="relative">
                    <MdLightbulb className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Tip for this step (optional)"
                      value={step.tips}
                      onChange={(e) => updateStep(i, "tips", e.target.value)}
                      className="w-full border border-stone-200 rounded-lg pl-7 pr-3 py-1.5 text-xs text-stone-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="text-stone-400 hover:text-red-600 mt-2"
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            ))}
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/"
              className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Uploading image..." : submitting ? "Publishing..." : "Publish Recipe"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
