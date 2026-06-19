/**
 * @file StepSangkap.tsx
 * @description Ingredient input form step inside the recipe creator wizard.
 * Renders dynamic ingredient input rows (amount, unit, name, notes) and handles row additions/deletions.
 */

import { useRef, useCallback } from "react"
import { MdClose } from "react-icons/md"
import type { Ingredient } from "@/lib/recipe-types"

type Props = {
  ingredients: Ingredient[]
  onChange: (ingredients: Ingredient[]) => void
}

let keyCounter = 0
function nextKey() { return ++keyCounter }

/**
 * Creates a default initialized Ingredient record with a unique key.
 * 
 * @returns {Ingredient & { _key: number }} The initialized ingredient item.
 */
export function createIngredient(): Ingredient & { _key: number } {
  return { _key: nextKey(), name: "", amount: "", unit: "", notes: "" }
}

/**
 * StepSangkap component.
 * Allows users to add, edit, and remove dynamic ingredient rows. Focuses on the next amount field when adding a row.
 * 
 * @param {Props} props Component properties.
 * @returns {JSX.Element} The rendered ingredients table list.
 */
export default function StepSangkap({ ingredients, onChange }: Props) {
  const amountRefs = useRef<(HTMLInputElement | null)[]>([])

  function addRow() {
    onChange([...ingredients, createIngredient()])
    setTimeout(() => amountRefs.current[ingredients.length]?.focus(), 0)
  }

  const update = useCallback(
    (i: number, field: keyof Ingredient, value: string) => {
      const updated = ingredients.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item,
      )
      onChange(updated)
    },
    [ingredients, onChange],
  )

  function removeRow(i: number) {
    if (ingredients.length > 1) {
      onChange(ingredients.filter((_, idx) => idx !== i))
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (ingredients[i].name || ingredients[i].amount) {
        addRow()
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Ingredients</h2>
        <button
          type="button"
          onClick={addRow}
          className="text-sm text-amber-600 font-medium hover:text-amber-700"
        >
          + Add Ingredient
        </button>
      </div>

      <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-stone-400 px-2">
        <span className="col-span-2">Amount</span>
        <span className="col-span-2">Unit</span>
        <span className="col-span-5">Ingredient</span>
        <span className="col-span-3">Notes</span>
      </div>

      {ingredients.map((ing, i) => (
        <div key={((ing as Ingredient & { _key?: number })._key ?? i).toString()} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-12 gap-2">
            <input
              ref={(el) => { amountRefs.current[i] = el }}
              type="text"
              placeholder="Amount"
              value={ing.amount}
              onChange={(e) => update(i, "amount", e.target.value)}
              className="col-span-2 border border-stone-300 rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Unit"
              value={ing.unit}
              onChange={(e) => update(i, "unit", e.target.value)}
              className="col-span-2 border border-stone-300 rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Ingredient name"
              value={ing.name}
              onChange={(e) => update(i, "name", e.target.value)}
              className="col-span-5 border border-stone-300 rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Notes"
              value={ing.notes}
              onChange={(e) => update(i, "notes", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="col-span-3 border border-stone-300 rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {ingredients.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-stone-400 hover:text-amber-600 mt-2"
            >
              <MdClose />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
