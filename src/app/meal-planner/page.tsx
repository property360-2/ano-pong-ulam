/**
 * @file page.tsx
 * @description Meal Planner page client component. Allows users to schedule recipes
 * for breakfast, lunch, and dinner. When a user clicks a slot, a dedicated search/recommendation
 * modal opens to assign a recipe, keeping the primary workspace clean and distraction-free.
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  MdCalendarMonth, 
  MdSearch, 
  MdClose, 
  MdChevronLeft, 
  MdChevronRight, 
  MdContentCopy, 
  MdStar, 
  MdDelete,
  MdAdd,
  MdVisibility,
  MdEdit,
  MdShoppingCart
} from "react-icons/md"
import Header from "@/components/Header"
import { useToast } from "@/lib/toast"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEALS = ["breakfast", "lunch", "dinner"] as const

type DayPlan = { breakfast?: number; lunch?: number; dinner?: number }
type MealPlanData = Record<string, DayPlan | undefined>

interface RecipeItem {
  id: number
  title: string
  slug: string
  category: string
  ingredients?: any[]
}

/**
 * MealPlannerPage component.
 * Main weekly planner layout. Renders the interactive grid (desktop) or carousel (mobile)
 * and opens a selection overlay modal when a slot is clicked.
 * 
 * @returns {JSX.Element} The rendered page layout.
 */
export default function MealPlannerPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [plan, setPlan] = useState<MealPlanData>({})
  const [recipes, setRecipes] = useState<RecipeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Track checked state of smart ingredients list
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([])
  
  // Navigation & Search State
  const [activeMobileDay, setActiveMobileDay] = useState("Monday")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Active target slot being assigned via modal
  const [activeAssignSlot, setActiveAssignSlot] = useState<{ day: string; meal: "breakfast" | "lunch" | "dinner" } | null>(null)
  
  // Track selected recipe slot details popover
  const [viewingSlotRecipe, setViewingSlotRecipe] = useState<{ day: string; meal: "breakfast" | "lunch" | "dinner"; recipe: RecipeItem } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const planRes = await fetch("/api/meal-plans").then((r) => r.json())
      if (planRes.plan) setPlan(planRes.plan)
      if (planRes.groceryList && Array.isArray(planRes.groceryList)) {
        setCheckedIngredients(planRes.groceryList)
      }
    } catch {
      toast.error("Failed to load planner data")
    } finally {
      setLoading(false)
    }
  }, [toast])

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (session && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchData()
    }
  }, [session, fetchData])

  // Lazy-load recipes only when the assign slot modal opens
  const [recipesLoading, setRecipesLoading] = useState(false)
  const recipesFetchedRef = useRef(false)

  useEffect(() => {
    if (!activeAssignSlot) return
    const shouldFetch = !recipesFetchedRef.current || searchQuery.length >= 2 || searchQuery.length === 0
    if (!shouldFetch) return
    recipesFetchedRef.current = true
    setRecipesLoading(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    params.set("limit", "20")
    fetch(`/api/recipes?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const rawList = Array.isArray(data) ? data : (data?.recipes || [])
        const list = rawList.filter((r: any) => !/asd|123|test/i.test(r.title) && !/asd|123|test/i.test(r.slug))
        setRecipes(list)
      })
      .catch(() => toast.error("Failed to load recipes"))
      .finally(() => setRecipesLoading(false))
  }, [activeAssignSlot, searchQuery, toast])

  /**
   * Updates a specific slot in the active schedule.
   * 
   * @param {string} day - Day of the week.
   * @param {"breakfast" | "lunch" | "dinner"} meal - Meal slot.
   * @param {number|null} recipeId - Recipe ID to assign or null to clear.
   */
  function setSlotRecipe(day: string, meal: "breakfast" | "lunch" | "dinner", recipeId: number | null) {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: recipeId ?? undefined,
      },
    }))
    toast.success(`Updated ${day} ${meal}`)
  }

  /**
   * Handles saving the modified meal plan.
   */
  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, groceryList: checkedIngredients }),
      })
      if (res.ok) {
        toast.success("Meal plan saved successfully!")
      } else {
        toast.error("Failed to save meal plan")
      }
    } catch {
      toast.error("Failed to save meal plan")
    } finally {
      setSaving(false)
    }
  }

  /**
   * Saves plan as a favorite weekly template in localStorage.
   */
  function saveAsFavoriteSet() {
    localStorage.setItem("fav_meal_plan_template", JSON.stringify(plan))
    toast.success("Saved as Favorite Weekly Template!")
  }

  /**
   * Loads template from localStorage or fallback defaults.
   */
  function loadFavoriteSet() {
    const saved = localStorage.getItem("fav_meal_plan_template")
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlan(parsed)
        toast.success("Loaded Favorite Weekly Template!")
      } catch {
        toast.error("Could not parse template")
      }
    } else {
      const defaultSet: MealPlanData = {}
      const sinigang = recipes.find(r => r.title.toLowerCase().includes("sinigang"))?.id || recipes[0]?.id
      const adobo = recipes.find(r => r.title.toLowerCase().includes("adobo"))?.id || recipes[1]?.id || recipes[0]?.id
      const tapsilog = recipes.find(r => r.title.toLowerCase().includes("tapsilog"))?.id || recipes[2]?.id || recipes[0]?.id
      
      DAYS.forEach((day) => {
        defaultSet[day] = {
          breakfast: tapsilog,
          lunch: sinigang,
          dinner: adobo
        }
      })
      setPlan(defaultSet)
      toast.success("Quick-Filled with Filipino Classics!")
    }
  }

  /**
   * Shifts selected mobile day carousel.
   * 
   * @param {number} dir - Slider direction offset.
   */
  function shiftMobileDay(dir: number) {
    const idx = DAYS.indexOf(activeMobileDay)
    let nextIdx = idx + dir
    if (nextIdx < 0) nextIdx = DAYS.length - 1
    if (nextIdx >= DAYS.length) nextIdx = 0
    setActiveMobileDay(DAYS[nextIdx])
  }

  // Filter recipes inside modal search
  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
        <div className="text-center bg-white border border-stone-200 p-8 rounded-2xl max-w-sm shadow-card">
          <span className="text-5xl text-amber-600 block mb-4"><MdCalendarMonth className="mx-auto" /></span>
          <h1 className="text-xl font-bold mb-2">Sign in to plan meals</h1>
          <p className="text-stone-500 text-sm mb-6">Create weekly menus, export shopping lists, and share luto schedules.</p>
          <Link
            href="/login"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-9 w-64 bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-5 w-48 bg-stone-100 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-20 bg-stone-200 rounded-xl animate-pulse" />
                <div className="col-span-3 grid grid-cols-3 gap-4">
                  {[1,2,3].map((j) => (
                    <div key={j} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // Generate the smart ingredients checklist dynamically based on active plan recipes
  const selectedRecipeIds = Object.values(plan)
    .flatMap((dayPlan) => (dayPlan ? Object.values(dayPlan) : []))
    .filter(Boolean)

  const selectedRecipes = recipes.filter((r) =>
    selectedRecipeIds.map(String).includes(String(r.id))
  )

  const aggregatedIngredients: { name: string; amount: string; unit: string }[] = []
  
  selectedRecipes.forEach((recipe) => {
    const recipeIngs = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
    recipeIngs.forEach((ing: any) => {
      const name = ing.name.trim()
      const existing = aggregatedIngredients.find(
        (i) => i.name.toLowerCase() === name.toLowerCase()
      )
      if (existing) {
        // Simple merge
        if (existing.unit === ing.unit && !isNaN(Number(existing.amount)) && !isNaN(Number(ing.amount))) {
          existing.amount = String(Number(existing.amount) + Number(ing.amount))
        } else {
          existing.amount = `${existing.amount} + ${ing.amount}`
          if (existing.unit !== ing.unit) {
            existing.unit = `${existing.unit}/${ing.unit}`
          }
        }
      } else {
        aggregatedIngredients.push({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        })
      }
    })
  })

  /**
   * Toggles the checked status of an ingredient.
   * 
   * @param {string} name - Ingredient name.
   */
  function toggleIngredient(key: string) {
    setCheckedIngredients((prev) =>
      prev.includes(key) ? prev.filter((n) => n !== key) : [...prev, key]
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Meal Planner</h1>
            <p className="text-stone-500">Plan your week&apos;s ulam and organize your kitchen.</p>
          </div>
          
          <div className="flex items-center gap-1 w-full md:w-auto">
            <button
              onClick={loadFavoriteSet}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-stone-100 font-medium"
            >
              <MdStar className="text-amber-500 text-base" />
              Quick-Fill
            </button>
            <button
              onClick={saveAsFavoriteSet}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1 text-xs text-stone-500 hover:text-stone-800 px-3 py-2 rounded-lg transition-colors border border-transparent hover:bg-stone-100 font-medium"
            >
              <MdContentCopy className="text-stone-450 text-base" />
              Save Template
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors text-sm"
            >
              {saving ? "Saving..." : "Save Plan"}
            </button>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="space-y-6">
          
          {/* Mobile Day Navigation Selector */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-stone-200 p-3 md:hidden">
            <button 
              onClick={() => shiftMobileDay(-1)}
              className="p-3 text-stone-500 hover:bg-stone-100 rounded-xl"
              aria-label="Previous day"
            >
              <MdChevronLeft className="text-2xl" />
            </button>
            <span className="font-bold text-lg text-stone-800">{activeMobileDay}</span>
            <button 
              onClick={() => shiftMobileDay(1)}
              className="p-3 text-stone-500 hover:bg-stone-100 rounded-xl"
              aria-label="Next day"
            >
              <MdChevronRight className="text-2xl" />
            </button>
          </div>

          {/* Mobile Day Card View */}
          <div className="md:hidden bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
            <h2 className="font-bold text-stone-800 text-sm uppercase tracking-wider mb-2">{activeMobileDay}&apos;s Menu</h2>
            {MEALS.map((meal) => {
              const recipeId = plan[activeMobileDay]?.[meal]
              const recipe = recipes.find(r => String(r.id) === String(recipeId))

              return (
                <div 
                  key={meal} 
                  onClick={() => {
                    if (recipe) {
                      setViewingSlotRecipe({ day: activeMobileDay, meal, recipe })
                    } else {
                      setSearchQuery("")
                      setActiveAssignSlot({ day: activeMobileDay, meal })
                    }
                  }}
                  className="group relative flex flex-col p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-stone-50/30 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold uppercase text-stone-400 tracking-wider">{meal}</span>
                    {recipe && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSlotRecipe(activeMobileDay, meal, null)
                        }}
                        className="text-stone-400 hover:text-red-600 p-1"
                        title="Remove recipe"
                      >
                        <MdDelete className="text-lg" />
                      </button>
                    )}
                  </div>
                  
                  {recipe ? (
                    <div>
                      <p className="font-bold text-stone-900 leading-tight">{recipe.title}</p>
                      <span className="inline-block text-[10px] uppercase font-semibold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5 mt-2">
                        {recipe.category}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-stone-400 text-sm italic py-1">
                      <MdAdd /> Tap to choose ulam...
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop Week Grid View */}
          <div className="hidden md:flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 p-4 font-bold text-stone-500 text-xs uppercase tracking-wider">
              <div>Day</div>
              <div className="col-span-3 grid grid-cols-3 gap-4">
                {MEALS.map(meal => <div key={meal}>{meal}</div>)}
              </div>
            </div>
            
            <div className="divide-y divide-stone-100">
              {DAYS.map((day) => (
                <div key={day} className="grid grid-cols-4 p-4 items-center">
                  <div className="font-bold text-stone-700">{day}</div>
                  
                  <div className="col-span-3 grid grid-cols-3 gap-4">
                    {MEALS.map((meal) => {
                      const recipeId = plan[day]?.[meal]
                      const recipe = recipes.find(r => String(r.id) === String(recipeId))

                      return (
                        <div
                          key={meal}
                          onClick={() => {
                            if (recipe) {
                              setViewingSlotRecipe({ day, meal, recipe })
                            } else {
                              setSearchQuery("")
                              setActiveAssignSlot({ day, meal })
                            }
                          }}
                          className="group relative p-3 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-stone-50/30 text-left transition-all cursor-pointer min-h-[90px] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{meal}</span>
                              {recipe && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSlotRecipe(day, meal, null)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-opacity p-0.5"
                                  title="Remove recipe"
                                >
                                  <MdDelete className="text-base" />
                                </button>
                              )}
                            </div>
                            {recipe ? (
                              <p className="font-semibold text-stone-850 text-sm leading-snug line-clamp-2">{recipe.title}</p>
                            ) : (
                              <div className="flex items-center gap-0.5 text-xs text-stone-400 italic py-1">
                                <MdAdd /> Choose ulam...
                              </div>
                            )}
                          </div>
                          
                          {recipe && (
                            <span className="self-start text-[9px] uppercase font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5 mt-1.5">
                              {recipe.category}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Slot Selection & Recommendation Dialog Popover */}
        {activeAssignSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[520px]">
              <button 
                onClick={() => setActiveAssignSlot(null)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100"
              >
                <MdClose className="text-xl" />
              </button>
              
              <h3 className="font-bold text-lg text-stone-900 mb-1">
                Choose Ulam for {activeAssignSlot.day}
              </h3>
              <p className="text-sm text-stone-500 mb-4 capitalize">
                Select a recipe recommendation for {activeAssignSlot.meal}
              </p>

              {/* Search Box inside Modal */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes, categories, or tags..."
                  autoFocus
                  className="w-full text-sm border border-stone-300 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <MdSearch className="absolute left-3 top-3 text-stone-400 text-lg" />
              </div>

              {/* Suggested Ulam Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4 items-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Suggestions:</span>
                {["Adobo", "Sinigang", "Pinakbet", "Breakfast", "Dessert"].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSearchQuery(chip.toLowerCase() === searchQuery.toLowerCase() ? "" : chip)}
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-colors ${
                      searchQuery.toLowerCase() === chip.toLowerCase()
                        ? "bg-red-600 text-white"
                        : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Scrollable list inside Modal */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {recipesLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map((n) => <div key={n} className="h-16 bg-stone-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : filteredRecipes.length === 0 ? (
                  <p className="text-sm text-stone-400 italic text-center py-8">No matching recipes found.</p>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      onClick={() => {
                        setSlotRecipe(activeAssignSlot.day, activeAssignSlot.meal, recipe.id)
                        setActiveAssignSlot(null)
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-stone-150 hover:border-amber-300 hover:bg-amber-50/20 text-left transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-semibold text-sm text-stone-850 truncate group-hover:text-amber-700">{recipe.title}</p>
                        <span className="text-[10px] uppercase font-bold text-stone-400">{recipe.category}</span>
                      </div>
                      <span className="text-xs text-amber-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slot Detail Actions Dialog (View, Edit, Delete) */}
        {viewingSlotRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-stone-200 max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
              <button 
                onClick={() => setViewingSlotRecipe(null)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100"
              >
                <MdClose className="text-xl" />
              </button>
              
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-700 bg-amber-100 self-start px-2 py-0.5 rounded mb-3 inline-block">
                {viewingSlotRecipe.recipe.category}
              </h3>
              
              <h2 className="font-extrabold text-2xl text-stone-900 leading-tight mb-1">
                {viewingSlotRecipe.recipe.title}
              </h2>
              
              <p className="text-xs text-stone-500 mb-6 font-medium capitalize">
                Scheduled for {viewingSlotRecipe.day} • {viewingSlotRecipe.meal}
              </p>

              <div className="flex flex-col gap-2.5">
                <Link
                  href={`/recipes/${viewingSlotRecipe.recipe.slug}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
                >
                  <MdVisibility className="text-lg" />
                  View Recipe Details
                </Link>

                <button
                  onClick={() => {
                    const { day, meal } = viewingSlotRecipe
                    setViewingSlotRecipe(null)
                    setSearchQuery("")
                    setActiveAssignSlot({ day, meal })
                  }}
                  className="flex items-center justify-center gap-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  <MdEdit className="text-lg text-stone-500" />
                  Change Recipe (Edit)
                </button>

                <button
                  onClick={() => {
                    const { day, meal } = viewingSlotRecipe
                    setSlotRecipe(day, meal, null)
                    setViewingSlotRecipe(null)
                  }}
                  className="flex items-center justify-center gap-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  <MdDelete className="text-lg text-red-500" />
                  Remove Recipe (Delete)
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Smart Shopping List Section */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mt-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MdShoppingCart className="text-xl text-amber-600" />
            <h2 className="text-lg font-bold text-stone-850">Smart Shopping List</h2>
          </div>
          <p className="text-xs text-stone-500 mb-6">
            A combined grocery checklist automatically generated from your planned ulam recipes.
          </p>

          {aggregatedIngredients.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-4 text-center">
              Schedule recipes in the planner grid above to automatically compile your grocery list.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-stone-450 border-b border-stone-100 pb-2">
                <span>Ingredient ({aggregatedIngredients.length} total)</span>
                <span>
                  {aggregatedIngredients.filter((i) => checkedIngredients.includes(i.name)).length} of{" "}
                  {aggregatedIngredients.length} checked
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                {aggregatedIngredients.map((ing) => {
                  const ingKey = `${ing.name}-${ing.unit}`
                  const isChecked = checkedIngredients.includes(ingKey)
                  return (
                    <label
                      key={ingKey}
                      onClick={() => toggleIngredient(ingKey)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border border-stone-150 hover:border-amber-300 hover:bg-stone-50/50 transition-all cursor-pointer select-none ${
                        isChecked ? "bg-stone-50/40 border-stone-100 text-stone-400" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span className={`text-xs font-semibold flex-1 ${isChecked ? "line-through" : "text-stone-700"}`}>
                        {ing.name}
                      </span>
                      {ing.amount && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          isChecked ? "bg-stone-100 text-stone-400" : "bg-amber-50 text-amber-700"
                        }`}>
                          {ing.amount} {ing.unit}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
