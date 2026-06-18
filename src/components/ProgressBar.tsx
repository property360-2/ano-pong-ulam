import { STEPS, type StepID } from "@/lib/recipe-steps"

type Props = {
  currentStep: StepID
  onStepClick: (id: StepID) => void
  completedSteps: Set<StepID>
  isEdit: boolean
}

export default function ProgressBar({ currentStep, onStepClick, completedSteps, isEdit }: Props) {
  return (
    <nav className="flex items-center justify-between px-1 py-4">
      {STEPS.map((step, i) => {
        const isActive = step.id === currentStep
        const isCompleted = completedSteps.has(step.id)
        const isClickable = isEdit || isCompleted || step.id === currentStep || completedSteps.has(currentStep)

        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                !isClickable ? "opacity-40 cursor-default" : "cursor-pointer"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isActive
                    ? "bg-amber-500 text-white shadow-md"
                    : isCompleted
                      ? "bg-amber-100 text-amber-700 border-2 border-amber-500"
                      : "bg-stone-100 text-stone-400 border-2 border-stone-200"
                }`}
              >
                {isCompleted ? "✓" : step.id}
              </span>
              <span
                className={`hidden sm:inline ${
                  isActive ? "text-amber-700 font-semibold" : "text-stone-500"
                }`}
              >
                {step.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full ${
                  isCompleted ? "bg-amber-500" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
