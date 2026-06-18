"use client"

/**
 * NumberStepper
 * A compact numeric input with - and + buttons for values like servings, time.
 * Props: value, onChange, min, max, name, label (optional)
 */
import { MdAdd, MdRemove } from "react-icons/md"

type Props = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  name?: string
  label?: string
}

export default function NumberStepper({ value, onChange, min = 0, max = 999, name, label }: Props) {
  function increment() {
    if (value < max) onChange(value + 1)
  }

  function decrement() {
    if (value > min) onChange(value - 1)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="block text-sm font-medium text-stone-700">{label}</label>}
      <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden w-28">
        <button
          type="button"
          onClick={decrement}
          className="px-2 py-2 text-stone-500 hover:text-amber-600 hover:bg-stone-50 transition-colors disabled:opacity-30"
          disabled={value <= min}
        >
          <MdRemove />
        </button>
        <input
          type="number"
          name={name}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value) || min
            onChange(Math.min(Math.max(v, min), max))
          }}
          className="w-full text-center text-sm py-2 border-x border-stone-200 focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={increment}
          className="px-2 py-2 text-stone-500 hover:text-amber-600 hover:bg-stone-50 transition-colors disabled:opacity-30"
          disabled={value >= max}
        >
          <MdAdd />
        </button>
      </div>
    </div>
  )
}
