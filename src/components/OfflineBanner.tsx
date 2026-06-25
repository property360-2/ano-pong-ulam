"use client"

import { useState, useEffect } from "react"
import { MdWifiOff, MdClose } from "react-icons/md"

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function goOnline() { setIsOffline(false); setDismissed(false) }
    function goOffline() { setIsOffline(true); setDismissed(false) }

    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)

    // Defer initial check to avoid hydration mismatch
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const id = setTimeout(() => setIsOffline(true), 0)
      return () => {
        clearTimeout(id)
        window.removeEventListener("online", goOnline)
        window.removeEventListener("offline", goOffline)
      }
    }

    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  if (!isOffline || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white px-4 py-2 flex items-center justify-between gap-2 text-sm font-medium shadow-lg">
      <div className="flex items-center gap-2">
        <MdWifiOff className="text-lg flex-shrink-0" />
        <span>You&apos;re offline — some features may be limited</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-amber-600 rounded transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <MdClose className="text-lg" />
      </button>
    </div>
  )
}
