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
  MdStar, 
  MdDelete,
  MdAdd,
  MdVisibility,
  MdLightMode,
  MdWbSunny,
  MdNightsStay,
  MdCookie,
  MdCheck
} from "react-icons/md"
import Header from "@/components/Header"
import { useToast } from "@/lib/toast"
import { useLanguage } from "@/lib/i18n"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MEALS = ["breakfast", "lunch", "dinner", "snacks"] as const

type DayPlan = { breakfast?: number[]; lunch?: number[]; dinner?: number[]; snacks?: number[] }
type MealPlanData = Record<string, DayPlan | undefined>

interface RecipeItem {
  id: number
  title: string
  slug: string
  category: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const { t } = useLanguage()
  
  const [plan, setPlan] = useState<MealPlanData>({})
  const [recipes, setRecipes] = useState<RecipeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  
  // Navigation & Search State
  const [activeMobileDay, setActiveMobileDay] = useState("Monday")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Active target slot being assigned via modal
  const [activeAssignSlot, setActiveAssignSlot] = useState<{ day: string; meal: "breakfast" | "lunch" | "dinner" | "snacks" } | null>(null)
  
  // Track selected recipe slot details popover
  const [viewingSlot, setViewingSlot] = useState<{ day: string; meal: "breakfast" | "lunch" | "dinner" | "snacks" } | null>(null)

  /**
   * Fetches the user's weekly meal plan from the database.
   * If a saved plan exists, it updates the local state and fetches full recipe details 
   * (e.g. titles, categories) for all recipe IDs in the plan from the backend, 
   * ensuring that recipe names display correctly in the planner grid.
   * 
   * @returns {Promise<void>} Resolves when the plan and its recipes are loaded.
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const planRes = await fetch("/api/meal-plans").then((r) => r.json())
      if (planRes.plan) {
        setPlan(planRes.plan)
        
        // Extract all recipe IDs from the meal plan
        const recipeIds = new Set<number>()
        Object.values(planRes.plan).forEach((dayPlan: unknown) => {
          const typedPlan = dayPlan as DayPlan | undefined
          if (typedPlan) {
            MEALS.forEach((meal) => {
              const ids = typedPlan[meal]
              if (Array.isArray(ids)) {
                ids.forEach((id: number) => recipeIds.add(Number(id)))
              } else if (ids) {
                recipeIds.add(Number(ids))
              }
            })
          }
        })
        
        const idList = Array.from(recipeIds)
        if (idList.length > 0) {
          const data = await fetch(`/api/recipes?ids=${idList.join(",")}&limit=50`).then((r) => r.json())
          const rawList = Array.isArray(data) ? data : (data?.recipes || [])
          const list = rawList.filter(
            (r: { title: string; slug: string }) =>
              !/asd|123|test/i.test(r.title) && !/asd|123|test/i.test(r.slug)
          )
          setRecipes(list)
        }
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

  const prevSlotRef = useRef<string | null>(null)

  useEffect(() => {
    if (!activeAssignSlot) return
    const slotKey = `${activeAssignSlot.day}-${activeAssignSlot.meal}`
    prevSlotRef.current = slotKey

    setTimeout(() => setRecipesLoading(true), 0)
    const params = new URLSearchParams()
    
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      if (activeAssignSlot.meal === "breakfast") {
        params.set("category", "breakfast")
      } else if (activeAssignSlot.meal === "lunch" || activeAssignSlot.meal === "dinner") {
        params.set("category", "ulam")
      } else if (activeAssignSlot.meal === "snacks") {
        params.set("category", "merienda")
      }
    }
    
    params.set("limit", "50")
    
    fetch(`/api/recipes?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const rawList = Array.isArray(data) ? data : (data?.recipes || [])
        const list = rawList.filter(
          (r: { title: string; slug: string }) =>
            !/asd|123|test/i.test(r.title) && !/asd|123|test/i.test(r.slug)
        )
        setRecipes(list)
      })
      .catch(() => toast.error("Failed to load recipes"))
      .finally(() => setRecipesLoading(false))
  }, [activeAssignSlot, searchQuery, toast])

  /**
   * Adds a recipe to a meal slot (appends to array).
   */
  function addRecipeToSlot(day: string, meal: "breakfast" | "lunch" | "dinner" | "snacks", recipeId: number) {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: [...(prev[day]?.[meal] || []), recipeId],
      },
    }))
  }

  /**
   * Removes a specific recipe from a meal slot.
   */
  function removeRecipeFromSlot(day: string, meal: "breakfast" | "lunch" | "dinner" | "snacks", recipeId: number) {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: (prev[day]?.[meal] || []).filter((id) => id !== recipeId),
      },
    }))
  }

  /**
   * Clears all recipes from a meal slot.
   */
  function clearSlot(day: string, meal: "breakfast" | "lunch" | "dinner" | "snacks") {
    setPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: [],
      },
    }))
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
        body: JSON.stringify({ plan }),
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
   * Quick-fills the weekly planner with Filipino classics.
   * Fetches recipes per-category from the API to ensure all meal types are covered,
   * then shuffles and assigns them across the week.
   * 
   * @returns {Promise<void>} Resolves when the plan is populated.
   */
  async function quickFill() {
    setLoading(true)
    try {
      const [allData, breakfastData] = await Promise.all([
        fetch("/api/recipes?limit=50").then((r) => r.json()),
        fetch("/api/recipes?category=breakfast&limit=50").then((r) => r.json()),
      ])

      const normalize = (data: unknown): RecipeItem[] => {
        const list = Array.isArray(data) ? data : ((data as { recipes?: RecipeItem[] })?.recipes || [])
        return list.filter(
          (r: { title: string; slug: string }) =>
            !/asd|123|test/i.test(r.title) && !/asd|123|test/i.test(r.slug)
        )
      }

      const allRecipes: RecipeItem[] = normalize(allData)
      const breakfastExtra: RecipeItem[] = normalize(breakfastData)

      // Merge and deduplicate breakfast recipes
      const breakfastRecipes = allRecipes
        .filter(
          (r) =>
            r.category.toLowerCase().includes("breakfast") ||
            r.category.toLowerCase().includes("almusal") ||
            r.title.toLowerCase().includes("silog")
        )
        .concat(breakfastExtra)
        .filter(
          (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
        )

      const ulamRecipes = allRecipes.filter((r) =>
        [
          "ulam", "soup", "vegetable", "gulay", "fiesta", "pampasko",
          "pasta", "seafood", "chicken", "beef", "pork", "rice",
          "noodle", "rice bowl",
        ].some((s) => r.category.toLowerCase().includes(s))
      )

      const snacksRecipes = allRecipes.filter((r) =>
        ["merienda", "dessert", "snacks", "drinks", "beverage"].some((s) =>
          r.category.toLowerCase().includes(s)
        )
      )

      // Merge all loaded recipes (general list + breakfast extra) into the state
      const combinedRecipes = [...allRecipes, ...breakfastExtra].filter(
        (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
      )
      setRecipes(combinedRecipes)

      function shuffleArray<T>(arr: T[]): T[] {
        const shuffled = [...arr]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }

      const shuffledUlam = shuffleArray(ulamRecipes)
      const shuffledBreakfast = shuffleArray(breakfastRecipes)
      const shuffledSnacks = shuffleArray(snacksRecipes)

      if (ulamRecipes.length === 0 && breakfastRecipes.length === 0 && snacksRecipes.length === 0) {
        if (allRecipes.length > 0) {
          const shuffled = shuffleArray(allRecipes)
          const fallbackSet: MealPlanData = {}
          DAYS.forEach((day, i) => {
            fallbackSet[day] = {
              breakfast: [shuffled[i % shuffled.length].id],
              lunch: [shuffled[(i + 1) % shuffled.length].id],
              dinner: [shuffled[(i + 2) % shuffled.length].id],
              snacks: [shuffled[(i + 3) % shuffled.length].id],
            }
          })
          setPlan(fallbackSet)
          toast.success("Quick-Filled with Filipino Classics!")
          return
        }
        toast.error("No recipes available to quick fill")
        return
      }

      const defaultSet: MealPlanData = {}
      DAYS.forEach((day, i) => {
        const breakfastItems: number[] = []
        const lunchItems: number[] = []
        const dinnerItems: number[] = []
        const snacksItems: number[] = []

        if (shuffledBreakfast.length > 0) {
          breakfastItems.push(shuffledBreakfast[i % shuffledBreakfast.length].id)
          if (shuffledBreakfast.length > 1) {
            breakfastItems.push(shuffledBreakfast[(i + 1) % shuffledBreakfast.length].id)
          }
        }

        if (shuffledUlam.length > 0) {
          lunchItems.push(shuffledUlam[i % shuffledUlam.length].id)
        }

        if (shuffledUlam.length > 1) {
          const dinnerOffset = Math.floor(shuffledUlam.length / 2)
          dinnerItems.push(shuffledUlam[(i + dinnerOffset) % shuffledUlam.length].id)
        } else if (shuffledUlam.length === 1) {
          dinnerItems.push(shuffledUlam[0].id)
        }

        if (shuffledSnacks.length > 0) {
          snacksItems.push(shuffledSnacks[i % shuffledSnacks.length].id)
        }

        defaultSet[day] = {
          breakfast: breakfastItems.length > 0 ? breakfastItems : undefined,
          lunch: lunchItems.length > 0 ? lunchItems : undefined,
          dinner: dinnerItems.length > 0 ? dinnerItems : undefined,
          snacks: snacksItems.length > 0 ? snacksItems : undefined,
        }
      })
      setPlan(defaultSet)
      toast.success("Quick-Filled with Filipino Classics!")
    } catch {
      toast.error("Failed to load recipes for quick fill")
    } finally {
      setLoading(false)
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
          <h1 className="text-xl font-bold mb-2">{t("meal.sign_in_prompt")}</h1>
          <p className="text-stone-500 text-sm mb-6">{t("meal.sign_in_desc")}</p>
          <Link
            href="/login"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
          >
            {t("common.sign_in")}
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


  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">{t("meal.title")}</h1>
            <p className="text-stone-500 text-sm mt-1">{t("meal.subtitle")}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <button
              onClick={quickFill}
              className="flex items-center justify-center gap-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 active:scale-[0.98] px-3.5 py-2.5 rounded-xl transition-all font-semibold border border-stone-200/40 shadow-sm cursor-pointer"
            >
              <MdStar className="text-amber-500 text-base" />
              {t("meal.quick_fill")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm cursor-pointer"
            >
              {saving ? t("meal.saving") : t("meal.save_plan")}
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
              aria-label={t("common.previous_day")}
            >
              <MdChevronLeft className="text-2xl" />
            </button>
            <span className="font-bold text-lg text-stone-800">{t(`common.day.${activeMobileDay.toLowerCase()}`)}</span>
            <button 
              onClick={() => shiftMobileDay(1)}
              className="p-3 text-stone-500 hover:bg-stone-100 rounded-xl"
              aria-label={t("common.next_day")}
            >
              <MdChevronRight className="text-2xl" />
            </button>
          </div>

          {/* Mobile Day Card View */}
          <div className="md:hidden bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
            <h2 className="font-bold text-stone-800 text-sm uppercase tracking-wider mb-2">{t(`common.day.${activeMobileDay.toLowerCase()}`)}{t("meal.menu_suffix")}</h2>
            {MEALS.map((meal) => {
              const recipeIds = plan[activeMobileDay]?.[meal] || []
              const slotRecipes = recipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean) as RecipeItem[]
              const firstRecipe = slotRecipes[0]
              const remainingCount = slotRecipes.length - 1
              const mealIcon = meal === "breakfast" 
                ? <MdLightMode className="text-amber-500 text-sm flex-shrink-0" />
                : meal === "lunch"
                ? <MdWbSunny className="text-orange-500 text-sm flex-shrink-0" />
                : meal === "dinner"
                ? <MdNightsStay className="text-indigo-500 text-sm flex-shrink-0" />
                : <MdCookie className="text-pink-500 text-sm flex-shrink-0" />

              return (
                <div 
                  key={meal} 
                  onClick={() => {
                    if (slotRecipes.length > 0) {
                      setViewingSlot({ day: activeMobileDay, meal })
                    } else {
                      setSearchQuery("")
                      setActiveAssignSlot({ day: activeMobileDay, meal })
                    }
                  }}
                  className={`group relative flex flex-col p-4 rounded-xl transition-all cursor-pointer border ${
                    slotRecipes.length > 0
                      ? "border-stone-200 bg-white hover:border-amber-300 hover:bg-stone-50/30" 
                      : "border-dashed border-2 border-stone-200/80 bg-stone-50/40 hover:bg-stone-50/80 hover:border-amber-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-stone-600 tracking-wider flex items-center gap-1.5">
                      {mealIcon}
                      {t(`common.meal.${meal}`)}
                    </span>
                    {slotRecipes.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          clearSlot(activeMobileDay, meal)
                        }}
                        className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                        title={t("common.remove_recipe")}
                      >
                        <MdDelete className="text-lg" />
                      </button>
                    )}
                  </div>
                  
                  {slotRecipes.length > 0 ? (
                    <div>
                      <p className="font-bold text-stone-900 leading-tight">{firstRecipe?.title}</p>
                      {slotRecipes.length === 1 ? (
                        <span className="inline-block text-[10px] uppercase font-bold text-amber-700 bg-amber-100/70 rounded px-1.5 py-0.5 mt-2">
                          {firstRecipe?.category}
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold text-amber-600 mt-1">
                          +{remainingCount} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-stone-500 font-semibold text-xs py-1">
                      <MdAdd className="text-stone-400 text-sm" /> {t("meal.tap_to_choose")}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop Week Grid View */}
          <div className="hidden md:flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="grid grid-cols-5 bg-stone-50 border-b border-stone-200 p-4 font-bold text-stone-500 text-xs uppercase tracking-wider">
              <div>Day</div>
              <div className="col-span-4 grid grid-cols-4 gap-4">
                {MEALS.map(meal => <div key={meal}>{t(`common.meal.${meal}`)}</div>)}
              </div>
            </div>
            
            <div className="divide-y divide-stone-100">
              {DAYS.map((day) => (
                <div key={day} className="grid grid-cols-5 p-4 items-center">
                  <div className="font-bold text-stone-700">{t(`common.day.${day.toLowerCase()}`)}</div>
                  
                  <div className="col-span-4 grid grid-cols-4 gap-4">
                    {MEALS.map((meal) => {
                      const recipeIds = plan[day]?.[meal] || []
                      const slotRecipes = recipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean) as RecipeItem[]
                      const firstRecipe = slotRecipes[0]
                      const remainingCount = slotRecipes.length - 1
                      const mealIcon = meal === "breakfast" 
                        ? <MdLightMode className="text-amber-500 text-[10px] flex-shrink-0" />
                        : meal === "lunch"
                        ? <MdWbSunny className="text-orange-500 text-[10px] flex-shrink-0" />
                        : meal === "dinner"
                        ? <MdNightsStay className="text-indigo-500 text-[10px] flex-shrink-0" />
                        : <MdCookie className="text-pink-500 text-[10px] flex-shrink-0" />

                      return (
                        <div
                          key={meal}
                          onClick={() => {
                            if (slotRecipes.length > 0) {
                              setViewingSlot({ day, meal })
                            } else {
                              setSearchQuery("")
                              setActiveAssignSlot({ day, meal })
                            }
                          }}
                          className={`group relative p-3 rounded-xl transition-all cursor-pointer min-h-[90px] flex flex-col justify-between border ${
                            slotRecipes.length > 0
                              ? "border-stone-200 bg-white hover:border-amber-300 hover:bg-stone-50/30" 
                              : "border-dashed border-2 border-stone-200/80 bg-stone-50/40 hover:bg-stone-50/80 hover:border-amber-300"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                                {mealIcon}
                                {t(`common.meal.${meal}`)}
                              </span>
                              {slotRecipes.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    clearSlot(day, meal)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-opacity p-0.5"
                                  title={t("common.remove_recipe")}
                                >
                                  <MdDelete className="text-base" />
                                </button>
                              )}
                            </div>
                            {slotRecipes.length > 0 ? (
                              <div>
                                <p className="font-semibold text-stone-850 text-sm leading-snug line-clamp-2">{firstRecipe?.title}</p>
                                {slotRecipes.length > 1 ? (
                                  <span className="text-[10px] font-bold text-amber-600">+{remainingCount} more</span>
                                ) : (
                                  <span className="self-start text-[9px] uppercase font-bold text-amber-700 bg-amber-100/70 rounded px-1.5 py-0.5 mt-1.5 inline-block">
                                    {firstRecipe?.category}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-stone-500 font-semibold text-[11px] py-1">
                                <MdAdd className="text-stone-400 text-sm" /> {t("meal.click_to_choose")}
                              </div>
                            )}
                          </div>
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
            <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[520px] max-h-[85vh] md:max-h-[90vh]">
              <button 
                onClick={() => setActiveAssignSlot(null)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100"
              >
                <MdClose className="text-xl" />
              </button>
              
              <h3 className="font-bold text-lg text-stone-900 mb-1">
                {t("meal.choose_ulam_for")} {activeAssignSlot.day}
              </h3>
              <p className="text-sm text-stone-500 mb-4 capitalize">
                {t("meal.select_for")} {t(`common.meal.${activeAssignSlot.meal}`)}
              </p>

              {/* Search Box inside Modal */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("meal.search_placeholder")}
                  autoFocus
                  className="w-full text-sm border border-stone-300 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <MdSearch className="absolute left-3 top-3 text-stone-400 text-lg" />
              </div>

              {/* Suggested Ulam Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4 items-center">
                <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">{t("meal.suggestions_label")}</span>
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

              {/* Currently assigned recipes in modal */}
              {(() => {
                const assignedIds = plan[activeAssignSlot.day]?.[activeAssignSlot.meal] || []
                const assigned = assignedIds.map(id => recipes.find(r => r.id === id)).filter(Boolean) as RecipeItem[]
                if (assigned.length === 0) return null
                return (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase font-bold text-stone-400 mb-1.5">Assigned:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {assigned.map(r => (
                        <span key={r.id} className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full px-2.5 py-1">
                          {r.title}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeRecipeFromSlot(activeAssignSlot.day, activeAssignSlot.meal, r.id)
                            }}
                            className="ml-0.5 text-amber-600 hover:text-red-600"
                          >
                            <MdClose className="text-sm" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Scrollable list inside Modal */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4">
                {recipesLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map((n) => <div key={n} className="h-16 bg-stone-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : filteredRecipes.length === 0 ? (
                  <p className="text-sm text-stone-400 italic text-center py-8">{t("meal.no_recipes")}</p>
                ) : (
                  filteredRecipes.map((recipe) => {
                    const assignedIds = plan[activeAssignSlot.day]?.[activeAssignSlot.meal] || []
                    const isAssigned = assignedIds.includes(recipe.id)
                    return (
                      <div
                        key={recipe.id}
                        onClick={() => {
                          if (!isAssigned) {
                            addRecipeToSlot(activeAssignSlot.day, activeAssignSlot.meal, recipe.id)
                          }
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer group bg-white shadow-sm ${
                          isAssigned
                            ? "border-amber-300 bg-amber-50/50 opacity-60 cursor-default"
                            : "border-stone-200 hover:border-amber-300 hover:bg-stone-50/40"
                        }`}
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-semibold text-sm text-stone-850 truncate group-hover:text-amber-700">{recipe.title}</p>
                          <span className="text-[10px] uppercase font-bold text-stone-400">{recipe.category}</span>
                        </div>
                        {isAssigned ? (
                          <MdCheck className="text-amber-600 text-base" />
                        ) : (
                          <MdAdd className="text-amber-600 text-base opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Slot Detail Actions Dialog (View all recipes in slot) */}
        {viewingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-stone-200 max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
              <button 
                onClick={() => setViewingSlot(null)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100"
              >
                <MdClose className="text-xl" />
              </button>
              
              <p className="text-xs text-stone-500 mb-4 font-medium capitalize">
                {t("meal.scheduled_for")} {viewingSlot.day} • {t(`common.meal.${viewingSlot.meal}`)}
              </p>

              {(() => {
                const recipeIds = plan[viewingSlot.day]?.[viewingSlot.meal] || []
                const slotRecipes = recipeIds.map(id => recipes.find(r => r.id === id)).filter(Boolean) as RecipeItem[]
                
                if (slotRecipes.length === 0) {
                  return <p className="text-sm text-stone-400 italic text-center py-8">No recipes assigned</p>
                }

                return (
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {slotRecipes.map((r) => (
                      <div key={r.id} className="border border-stone-200 rounded-xl p-4">
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/70 rounded px-1.5 py-0.5 inline-block mb-2">
                          {r.category}
                        </span>
                        <h3 className="font-bold text-stone-900">{r.title}</h3>
                        <div className="flex gap-2 mt-3">
                          <Link
                            href={`/recipes/${r.slug}`}
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all"
                          >
                            <MdVisibility className="text-sm" />
                            View
                          </Link>
                          <button
                            onClick={() => {
                              removeRecipeFromSlot(viewingSlot.day, viewingSlot.meal, r.id)
                            }}
                            className="flex items-center justify-center gap-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2 px-3 rounded-xl transition-all"
                          >
                            <MdDelete className="text-sm" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}

              <div className="mt-4 pt-3 border-t border-stone-100">
                <button
                  onClick={() => {
                    const { day, meal } = viewingSlot
                    setViewingSlot(null)
                    setSearchQuery("")
                    setActiveAssignSlot({ day, meal })
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold py-3 px-4 rounded-xl transition-all"
                >
                  <MdAdd className="text-lg text-stone-500" />
                  Add Recipe
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
