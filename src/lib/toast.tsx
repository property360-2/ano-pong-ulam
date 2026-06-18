"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { MdCheckCircle, MdError, MdInfo, MdClose } from "react-icons/md"

type ToastType = "success" | "error" | "info"

type Toast = {
  id: number
  type: ToastType
  message: string
}

type ToastContextValue = {
  toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    info: (msg: string) => addToast("info", msg),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up ${
              t.type === "success"
                ? "bg-green-600 text-white"
                : t.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-amber-600 text-white"
            }`}
          >
            {t.type === "success" ? (
              <MdCheckCircle className="text-lg flex-shrink-0 mt-0.5" />
            ) : t.type === "error" ? (
              <MdError className="text-lg flex-shrink-0 mt-0.5" />
            ) : (
              <MdInfo className="text-lg flex-shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="flex-shrink-0 opacity-70 hover:opacity-100">
              <MdClose />
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
