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
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // NOTE: Registration failure is non-fatal — app works without SW
        })
      })
    }
  }, [])

  return null
}
