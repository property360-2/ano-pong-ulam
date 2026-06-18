"use client"

import { useState, useEffect } from "react"
import { MdClose } from "react-icons/md"

/**
 * InstallPrompt
 * Shows a dismissible "Add to Home Screen" banner when the browser fires the
 * beforeinstallprompt event (Chrome/Android) or when running standalone on iOS.
 *
 * iOS caveat: beforeinstallprompt is not supported on Safari. iOS users must
 * manually tap the Share button → "Add to Home Screen". This component shows a
 * helpful tip for iOS users who already have the app in standalone mode.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // NOTE: Check if already running as standalone (PWA mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true)
      return
    }

    // NOTE: Detect iOS Safari
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    setIsIOS(iOS)

    if (iOS) return // iOS doesn't support beforeinstallprompt

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // NOTE: Only show after a short delay so the page loads first
      setTimeout(() => setShowPrompt(true), 2000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) return null
  if (showPrompt === false && !isIOS) return null

  async function handleInstall() {
    if (!deferredPrompt) return
    ;(deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt()
    const result = await (
      deferredPrompt as unknown as { userChoice: Promise<{ outcome: string }> }
    ).userChoice

    if (result.outcome === "accepted") {
      setShowPrompt(false)
      setDismissed(true)
    }
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    setShowPrompt(false)
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-xl border border-stone-200 shadow-lg p-4 flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-900">
            {isIOS ? "Install on iOS" : "Install Ano Pong Ulam?"}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            {isIOS
              ? 'Tap the Share button → "Add to Home Screen"'
              : "Add to your home screen for the best experience"}
          </p>
        </div>
        {isIOS ? (
          <button
            onClick={handleDismiss}
            className="text-xs text-stone-500 hover:text-stone-800 font-medium"
          >
            Got it
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="bg-red-600 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-stone-400 hover:text-stone-600"
              aria-label="Dismiss"
            >
              <MdClose />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
