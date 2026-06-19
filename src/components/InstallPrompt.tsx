/**
 * @file InstallPrompt.tsx
 * @description Dismissible prompt to help iOS Safari users install the application.
 * Chrome/Android users install via the UserMenu dropdown, while iOS Safari users are shown
 * installation guide instructions.
 */

"use client"

import { useState, useEffect } from "react"
import { usePwa } from "@/hooks/usePwa"

/**
 * InstallPrompt component.
 * Renders a small guide banner at the bottom of the screen specifically for iOS Safari users,
 * since iOS Safari does not support programmatic beforeinstallprompt prompts.
 * 
 * @returns {JSX.Element | null} The guide banner or null if not applicable/dismissed.
 */
export default function InstallPrompt() {
  const { isStandalone, isIOS } = usePwa()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Only show guide to iOS users not already in standalone mode, after a small delay
    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => setShowPrompt(true), 2500)
      return () => clearTimeout(timer)
    }
  }, [isIOS, isStandalone])

  function handleDismiss() {
    setShowPrompt(false)
    setDismissed(true)
  }

  if (isStandalone || dismissed || !isIOS || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-xl border border-stone-200 shadow-lg p-4 flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-900">
            Install on iOS
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            {'Tap the Share button → "Add to Home Screen"'}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-xs text-stone-500 hover:text-stone-800 font-medium min-h-[44px] px-2 flex items-center"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

