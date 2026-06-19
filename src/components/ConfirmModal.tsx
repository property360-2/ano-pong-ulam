"use client"

import { MdClose } from "react-icons/md"

type Props = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ isOpen, title, message, confirmLabel = "Yes", cancelLabel = "Cancel", onConfirm, onCancel }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl border border-stone-200 max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-stone-900">{title}</h3>
          <button onClick={onCancel} className="p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100">
            <MdClose className="text-xl" />
          </button>
        </div>
        <p className="text-sm text-stone-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-stone-300 text-stone-700 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-stone-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-red-700 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
