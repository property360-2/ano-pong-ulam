"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { type StepID } from "@/lib/recipe-steps"
import type { RecipeFormData, Ingredient, Step } from "@/lib/recipe-types"
import ProgressBar from "./ProgressBar"
import StepKuwento from "./StepKuwento"
import StepDetalye from "./StepDetalye"
import StepSangkap from "./StepSangkap"
import StepHakbang from "./StepHakbang"
import RecipePreview from "./RecipePreview"

let keyCounter = 0
function nextKey() { return ++keyCounter }

function withKeys(ingredients: Ingredient[]): (Ingredient & { _key: number })[] {
  return ingredients.map((i) => ({ ...i, _key: nextKey() }))
}

type Props = {
  mode: "create" | "edit"
  initialData?: RecipeFormData
  recipeSlug?: string
}

function defaultFormData(): RecipeFormData {
  return {
    title: "",
    description: null,
    story: null,
    category: "",
    region: null,
    difficulty: "easy",
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    heroImage: null,
    ingredients: withKeys([{ name: "", amount: "", unit: "", notes: "" }]),
    steps: [{ instruction: "", tips: "" }],
    tags: [],
  }
}

const STORAGE_KEY_CREATE = "recipe-wizard-draft"

/**
 * RecipeForm component.
 * Renders a multi-step recipe creator/editor wizard including draft saving, progress indicators,
 * field validation, image upload, and server synchronizations.
 * 
 * @param {Object} props Component properties.
 * @param {"create"|"edit"} props.mode The wizard operating mode.
 * @param {RecipeFormData} [props.initialData] Pre-filled recipe details for edit mode.
 * @param {string} [props.recipeSlug] Database slug of the recipe in edit mode.
 * @returns {JSX.Element} The rendered multi-step recipe form.
 */
export default function RecipeForm({ mode, initialData, recipeSlug }: Props) {
  const router = useRouter()
  const isEdit = mode === "edit"

  const [currentStep, setCurrentStep] = useState<StepID>(1)
  const [formData, setFormData] = useState<RecipeFormData>(() => {
    if (initialData) {
      return {
        ...initialData,
        ingredients: withKeys(initialData.ingredients),
      }
    }
    return defaultFormData()
  })
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [completedSteps, setCompletedSteps] = useState<Set<StepID>>(() => new Set())

  /**
   * Patches the form data state with partial updates.
   * 
   * @param {Partial<RecipeFormData>} patch The state updates.
   */
  function patchData(patch: Partial<RecipeFormData>) {
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  /**
   * Replaces the ingredients list in the form data.
   * 
   * @param {Ingredient[]} ings The updated ingredients array.
   */
  function setIngredients(ings: Ingredient[]) {
    setFormData((prev) => ({ ...prev, ingredients: ings }))
  }

  /**
   * Replaces the steps list in the form data.
   * 
   * @param {Step[]} steps The updated steps array.
   */
  function setSteps(steps: Step[]) {
    setFormData((prev) => ({ ...prev, steps }))
  }

  /**
   * Navigates to a specific step.
   * 
   * @param {StepID} id The destination step identifier.
   */
  function goToStep(id: StepID) {
    setCurrentStep(id)
    setError("")
  }

  /**
   * Validates required inputs of the current step.
   * 
   * @param {StepID} step The step to validate.
   * @returns {boolean} True if validation passes, false otherwise.
   */
  function validateStep(step: StepID): boolean {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError("Recipe title is required.")
          return false
        }
        return true
      case 2:
        if (!formData.category) {
          setError("Category is required.")
          return false
        }
        return true
      case 3:
        if (!formData.ingredients.some((i) => i.name && i.amount)) {
          setError("Add at least one ingredient with a name and amount.")
          return false
        }
        return true
      case 4:
        if (!formData.steps.some((s) => s.instruction)) {
          setError("Add at least one instruction step.")
          return false
        }
        return true
      default:
        return true
    }
  }

  /**
   * Triggers navigation to the next step, marking the current step as completed.
   */
  function handleNext() {
    setError("")
    if (!validateStep(currentStep)) return
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      next.add(currentStep)
      return next
    })
    const next = (currentStep + 1) as StepID
    if (next <= 5) {
      setCurrentStep(next)
    }
  }


  function handleBack() {
    setError("")
    const prev = (currentStep - 1) as StepID
    if (prev >= 1) setCurrentStep(prev)
  }

  async function handlePublish() {
    setSubmitting(true)
    setUploading(true)
    setError("")

    try {
      let heroImage = formData.heroImage || ""

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

      const body = {
        title: formData.title,
        description: formData.description || null,
        story: formData.story || null,
        category: formData.category,
        region: formData.region || null,
        difficulty: formData.difficulty,
        prepTime: formData.prepTime || null,
        cookTime: formData.cookTime || null,
        servings: formData.servings,
        heroImage,
        ingredients: formData.ingredients
          .filter((i) => i.name && i.amount)
          .map((i) => ({ name: i.name, amount: i.amount, unit: i.unit, notes: i.notes || undefined })),
        steps: formData.steps
          .filter((s) => s.instruction)
          .map((s, idx) => ({ number: idx + 1, instruction: s.instruction, tips: s.tips || undefined })),
        tags: formData.tags,
      }

      const url = isEdit && recipeSlug ? `/api/recipes/${recipeSlug}` : "/api/recipes"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save recipe")
      }

      const recipe = await res.json()
      localStorage.removeItem(STORAGE_KEY_CREATE)
      if (recipeSlug) localStorage.removeItem(`recipe-wizard-edit-${recipeSlug}`)
      router.push(`/recipes/${recipe.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const saveDraft = useCallback(() => {
    if (!isEdit) {
      const draftable = { ...formData }
      delete (draftable as Partial<RecipeFormData>).heroImage
      localStorage.setItem(STORAGE_KEY_CREATE, JSON.stringify(draftable))
    }
  }, [formData, isEdit])

  useEffect(() => {
    const timer = setTimeout(saveDraft, 500)
    return () => clearTimeout(timer)
  }, [saveDraft, currentStep])

  useEffect(() => {
    if (isEdit) return
    const saved = localStorage.getItem(STORAGE_KEY_CREATE)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed.title || parsed.ingredients?.some((i: Ingredient) => i.name)) {
        setTimeout(() => {
          const confirmed = window.confirm("We found a draft from your last session. Restore it?")
          if (confirmed) {
            setFormData((prev) => ({
              ...prev,
              ...parsed,
              ingredients: withKeys(parsed.ingredients || prev.ingredients),
            }))
          } else {
            localStorage.removeItem(STORAGE_KEY_CREATE)
          }
        }, 0)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY_CREATE)
    }
  }, [isEdit])

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <StepKuwento data={formData} onChange={patchData} heroFile={heroFile} onHeroFile={setHeroFile} />
      case 2:
        return <StepDetalye data={formData} onChange={patchData} />
      case 3:
        return <StepSangkap ingredients={formData.ingredients} onChange={setIngredients} />
      case 4:
        return <StepHakbang steps={formData.steps} onChange={setSteps} />
      case 5:
        return <RecipePreview data={formData} heroFile={heroFile} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-4xl w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">
          {isEdit ? "Edit Recipe" : "Share a Recipe"}
        </h1>
        <p className="text-stone-500 mb-6">
          {isEdit
            ? "Update your recipe below."
            : "Share your family recipe with the community — every lola's recipe deserves to be preserved."}
        </p>

        <div className="bg-white rounded-2xl border border-stone-200">
          <div className="px-6 pt-4 border-b border-stone-100">
            <ProgressBar
              currentStep={currentStep}
              onStepClick={goToStep}
              completedSteps={completedSteps}
              isEdit={isEdit}
            />
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
            )}

            {renderStep()}

            <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    ← Back
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="px-6 py-3 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    Cancel
                  </Link>
                )}
              </div>

              <div className="flex gap-3">
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm"
                  >
                    {currentStep === 4 ? "Luto Na! →" : "Next →"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={submitting}
                    className="bg-red-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {uploading
                      ? "Uploading image..."
                      : submitting
                        ? "Saving..."
                        : isEdit
                          ? "Save Changes"
                          : "Publish Recipe 🎉"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
