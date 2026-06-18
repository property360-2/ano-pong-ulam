import { MdClose, MdLightbulb } from "react-icons/md"
import type { Step } from "@/lib/recipe-types"

type Props = {
  steps: Step[]
  onChange: (steps: Step[]) => void
}

export default function StepHakbang({ steps, onChange }: Props) {
  function addStep() {
    onChange([...steps, { instruction: "", tips: "" }])
  }

  function update(i: number, field: keyof Step, value: string) {
    const updated = steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    onChange(updated)
  }

  function removeStep(i: number) {
    if (steps.length > 1) {
      onChange(steps.filter((_, idx) => idx !== i))
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (steps[i].instruction) {
        addStep()
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Instructions</h2>
        <button
          type="button"
          onClick={addStep}
          className="text-sm text-amber-600 font-medium hover:text-amber-700"
        >
          + Add Step
        </button>
      </div>

      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <span className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
            {i + 1}
          </span>
          <div className="flex-1 space-y-2">
            <textarea
              placeholder="Describe this step..."
              value={step.instruction}
              onChange={(e) => update(i, "instruction", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              rows={2}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="relative">
              <MdLightbulb className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
              <input
                type="text"
                placeholder="Tip for this step (optional)"
                value={step.tips}
                onChange={(e) => update(i, "tips", e.target.value)}
                className="w-full border border-stone-200 rounded-xl pl-7 pr-3 py-1.5 text-xs text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          {steps.length > 1 && (
            <button
              type="button"
              onClick={() => removeStep(i)}
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
