"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MdCalendarMonth, MdRestaurant } from "react-icons/md"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEALS = ["breakfast", "lunch", "dinner"] as const

type DayPlan = { breakfast?: number; lunch?: number; dinner?: number }
type MealPlanData = Record<string, DayPlan | undefined>

export default function MealPlannerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [plan, setPlan] = useState<MealPlanData>({})
  const [recipes, setRecipes] = useState<Array<{ id: number; title: string; slug: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    Promise.all([
      fetch("/api/meal-plans").then((r) => r.json()),
      fetch("/api/recipes").then((r) => r.json()),
    ]).then(([planData, recipesData]) => {
      if (planData.plan) setPlan(planData.plan)
      if (Array.isArray(recipesData)) setRecipes(recipesData.slice(0, 20))
      setLoading(false)
    })
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4"><MdCalendarMonth /></span>
          <h1 className="text-xl font-bold mb-2">Sign in to plan meals</h1>
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

  function setRecipe(day: string, meal: string, recipeId: number | null) {
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: recipeId ?? undefined },
    }))
  }

  function getRecipeTitle(id: number | undefined) {
    if (!id) return ""
    return recipes.find((r) => r.id === id)?.title || ""
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg inline-flex items-center gap-1">
            <MdRestaurant /> Ano Pong <span className="text-amber-600">Ulam?</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/recipes" className="hover:text-amber-600">Recipes</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meal Planner</h1>
            <p className="text-stone-500">Plan your week's ulam</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Plan"}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left p-3 font-medium text-stone-500 w-24">Day</th>
                {MEALS.map((meal) => (
                  <th key={meal} className="text-left p-3 font-medium text-stone-500 capitalize">{meal}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day} className="border-b border-stone-100 last:border-0">
                  <td className="p-3 font-medium">{day.slice(0, 3)}</td>
                  {MEALS.map((meal) => (
                    <td key={meal} className="p-2">
                      <select
                        value={plan[day]?.[meal] ?? ""}
                        onChange={(e) => setRecipe(day, meal, e.target.value ? Number(e.target.value) : null)}
                        className="w-full border border-stone-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        <option value="">—</option>
                        {recipes.map((r) => (
                          <option key={r.id} value={r.id}>{r.title}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
