"use client"

import { useEffect } from "react"

/**
 * ServiceWorkerRegister
 * Registers the service worker on the client side after the app loads.
 * Only runs in production — development uses HMR which conflicts with SW caching.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.hostname !== "localhost"
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
