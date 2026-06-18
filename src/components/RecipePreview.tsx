import { useMemo } from "react"
import { MdRestaurant, MdLocationOn, MdLightbulb } from "react-icons/md"
import type { RecipeFormData } from "@/lib/recipe-types"

type Props = {
  data: RecipeFormData
  heroFile?: File | null
}

export default function RecipePreview({ data, heroFile }: Props) {
  const heroPreviewUrl = useMemo(() => {
    if (heroFile) return URL.createObjectURL(heroFile)
    return null
  }, [heroFile])

  const heroSrc = data.heroImage || heroPreviewUrl

  const validIngredients = data.ingredients.filter((i) => i.name && i.amount)
  const validSteps = data.steps.filter((s) => s.instruction)

  return (
    <div>
      {heroSrc ? (
        <img
          src={heroSrc}
          alt={data.title}
          className="w-full h-64 md:h-96 object-cover rounded-t-xl"
        />
      ) : (
        <div className="w-full h-64 md:h-96 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-6xl rounded-t-xl">
          <MdRestaurant />
        </div>
      )}

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {data.category && (
            <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded capitalize">
              {data.category}
            </span>
          )}
          {data.region && (
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded inline-flex items-center gap-0.5">
              <MdLocationOn /> {data.region}
            </span>
          )}
          {data.difficulty && (
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded capitalize">
              {data.difficulty}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{data.title || "Untitled Recipe"}</h1>
          {data.description && (
            <p className="text-stone-600 mt-2">{data.description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
          {data.prepTime > 0 && <span>Prep: {data.prepTime}min</span>}
          {data.cookTime > 0 && <span>Cook: {data.cookTime}min</span>}
          <span>Serves: {data.servings}</span>
        </div>

        {data.story && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 italic">&ldquo;{data.story}&rdquo;</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Ingredients</h2>
            {validIngredients.length === 0 ? (
              <p className="text-stone-400 text-sm italic">No ingredients added yet.</p>
            ) : (
              <ul className="space-y-2">
                {validIngredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      readOnly
                      className="mt-1 accent-amber-500"
                    />
                    <span>
                      <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                      {ing.notes && <span className="text-stone-400"> — {ing.notes}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Instructions</h2>
            {validSteps.length === 0 ? (
              <p className="text-stone-400 text-sm italic">No instructions added yet.</p>
            ) : (
              <ol className="space-y-4">
                {validSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-brand text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm">{step.instruction}</p>
                      {step.tips && (
                        <p className="text-xs text-amber-700 mt-1 inline-flex items-center gap-0.5">
                          <MdLightbulb /> {step.tips}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
