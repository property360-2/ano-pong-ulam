/**
 * @file usePwa.ts
 * @description A custom hook that manages PWA installation state, listens to the 'beforeinstallprompt' event,
 * and provides methods to trigger the install prompt or detect standalone display mode.
 * Fits into the UI system by enabling client-side menus (like the Header and UserMenu) to conditionally display install buttons.
 */

"use client"

import { useState, useEffect } from "react"

// Define a type for the beforeinstallprompt event since it is not standard in default DOM types
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  prompt(): Promise<void>
}

/**
 * Custom hook to manage PWA states.
 * 
 * @returns {Object} An object containing:
 * - isStandalone: boolean indicating if app is launched in standalone mode.
 * - isIOS: boolean indicating if device is iOS.
 * - installable: boolean indicating if Chrome/Android install prompt is available.
 * - triggerInstall: function to invoke the deferred browser installation prompt.
 */
export function usePwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already running in standalone display mode
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone)
    ) {
      setTimeout(() => setIsStandalone(true), 0)
      return
    }

    // Detect iOS
    const iOS =
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !("MSStream" in window)
    setTimeout(() => setIsIOS(iOS), 0)

    if (iOS) return

    const handlePrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handlePrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt)
    }
  }, [])

  /**
   * Prompts the user to install the PWA if the prompt is deferred.
   * 
   * @returns {Promise<boolean>} True if accepted, false otherwise.
   */
  async function triggerInstall(): Promise<boolean> {
    if (!deferredPrompt) return false
    
    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null)
        return true
      }
    } catch (err) {
      console.error("PWA install prompt error:", err)
    }
    return false
  }

  return {
    isStandalone,
    isIOS,
    installable: !!deferredPrompt,
    triggerInstall,
  }
}
