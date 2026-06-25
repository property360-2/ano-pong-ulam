/**
 * @file ServiceWorkerRegister.tsx
 * @description Client-side component to register the PWA Service Worker.
 * It ensures offline caching is activated only in production environments, preventing
 * conflicts with Hot Module Replacement (HMR) and WebSockets during development.
 */

"use client"

import { useEffect, useState } from "react"

/**
 * ServiceWorkerRegister component.
 * Registers the PWA service worker ('/sw.js') on the client side after the window load event.
 * It is conditionally activated only when `process.env.NODE_ENV === "production"` to avoid
 * development server conflicts with service worker caching.
 * Also detects when a new service worker is available and shows an update prompt.
 */
export default function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            setRegistration(reg)
            console.log("Service Worker registered successfully with scope:", reg.scope)

            if (reg.waiting) {
              setUpdateAvailable(true)
            }

            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    setUpdateAvailable(true)
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
          })
      }

      if (document.readyState === "complete") {
        registerSW()
      } else {
        window.addEventListener("load", registerSW)
        return () => window.removeEventListener("load", registerSW)
      }
    }
  }, [])

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-[60] bg-stone-900 text-white rounded-xl p-3 flex items-center justify-between shadow-xl max-w-md mx-auto">
      <span className="text-sm font-medium">New version available</span>
      <button
        onClick={() => {
          if (registration?.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" })
          }
          window.location.reload()
        }}
        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
      >
        Update
      </button>
    </div>
  )
}
