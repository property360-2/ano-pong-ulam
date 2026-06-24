/**
 * @file ServiceWorkerRegister.tsx
 * @description Client-side component to register the PWA Service Worker.
 * It ensures offline caching is activated only in production environments, preventing
 * conflicts with Hot Module Replacement (HMR) and WebSockets during development.
 */

"use client"

import { useEffect } from "react"

/**
 * ServiceWorkerRegister component.
 * Registers the PWA service worker ('/sw.js') on the client side after the window load event.
 * It is conditionally activated only when `process.env.NODE_ENV === "production"` to avoid
 * development server conflicts with service worker caching.
 * 
 * @returns {null} This component is headless and renders nothing.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered successfully with scope:", registration.scope)
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

  return null
}
