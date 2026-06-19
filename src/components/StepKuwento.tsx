/**
 * @file StepKuwento.tsx
 * @description First step form panel in recipe creation. Users input the title,
 * short description, story behind the recipe, and drag-and-drop a hero image.
 */

import DropZone from "./DropZone"
import type { RecipeFormData } from "@/lib/recipe-types"

type Props = {
  data: RecipeFormData
  onChange: (patch: Partial<RecipeFormData>) => void
  onHeroFile: (f: File | null) => void
}

/**
 * StepKuwento component.
 * Renders recipe meta fields (title, desc, story, cover photo) for recipe form wizard.
 * 
 * @param {Props} props - Component properties.
 * @returns {JSX.Element} The story step form segment.
 */
export default function StepKuwento({ data, onChange, onHeroFile }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Recipe Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g., Sinigang na Baboy"
          className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Short Description
        </label>
        <textarea
          id="description"
          rows={2}
          value={data.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="A comforting sour soup perfect for rainy days..."
          className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hero Image</label>
        <DropZone onFile={onHeroFile} currentImage={data.heroImage} hint="Max 5MB. JPEG, PNG, WebP, or GIF." />
      </div>

      <div>
        <label htmlFor="story" className="block text-sm font-medium mb-1">
          The Story Behind This Recipe
        </label>
        <textarea
          id="story"
          rows={3}
          value={data.story || ""}
          onChange={(e) => onChange({ story: e.target.value })}
          placeholder="Lola Maria's original recipe from 1960s Batangas..."
          className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
    </div>
  )
}
