import NumberStepper from "./NumberStepper"
import type { RecipeFormData } from "@/lib/recipe-types"

type Props = {
  data: RecipeFormData
  onChange: (patch: Partial<RecipeFormData>) => void
}

const CATEGORIES = [
  { value: "ulam", label: "Ulam" },
  { value: "merienda", label: "Merienda" },
  { value: "breakfast", label: "Pang-almusal" },
  { value: "fiesta", label: "Pampasko / Fiesta" },
  { value: "vegetable", label: "Lutong Gulay" },
  { value: "dessert", label: "Dessert" },
  { value: "soup", label: "Soup / Sabaw" },
  { value: "rice", label: "Rice / Kanin" },
]

const REGIONS = [
  { value: "tagalog", label: "Tagalog" },
  { value: "bicol", label: "Bicol" },
  { value: "ilocano", label: "Ilocano" },
  { value: "kapampangan", label: "Kapampangan" },
  { value: "visayas", label: "Visayas" },
  { value: "mindanao", label: "Mindanao" },
  { value: "diaspora", label: "Diaspora / International" },
]

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export default function StepDetalye({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">Category *</label>
          <select
            id="category"
            required
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full border border-stone-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select...</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium mb-1">Region</label>
          <select
            id="region"
            value={data.region || ""}
            onChange={(e) => onChange({ region: e.target.value || null })}
            className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Any region</option>
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            id="difficulty"
            value={data.difficulty || "easy"}
            onChange={(e) => onChange({ difficulty: e.target.value })}
            className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberStepper
          value={data.servings}
          onChange={(v) => onChange({ servings: v })}
          min={1}
          max={50}
          name="servings"
          label="Servings"
        />
        <NumberStepper
          value={data.prepTime}
          onChange={(v) => onChange({ prepTime: v })}
          min={0}
          max={999}
          name="prepTime"
          label="Prep Time (min)"
        />
        <NumberStepper
          value={data.cookTime}
          onChange={(v) => onChange({ cookTime: v })}
          min={0}
          max={999}
          name="cookTime"
          label="Cook Time (min)"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags</label>
        <input
          id="tags"
          type="text"
          value={data.tags.join(", ")}
          onChange={(e) => onChange({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
          placeholder="budget, lenten, freezer-friendly, kids-love-it (comma separated)"
          className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
    </div>
  )
}
