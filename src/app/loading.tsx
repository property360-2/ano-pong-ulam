/**
 * @file loading.tsx
 * @description Global fallback loading spinner component.
 * Displays a centering branded logo and progress indicator during route transitions.
 */

import Image from "next/image"

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-stone-50 px-4">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing Brand Logo Container */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 animate-pulse bg-white p-3 rounded-2xl shadow-md border border-stone-200 flex items-center justify-center">
          <Image
            src="/logo-no-bg.png"
            alt="Loading..."
            width={56}
            height={56}
            className="object-contain"
            priority
          />
        </div>

        {/* Brand Name */}
        <h2 className="text-xl font-bold text-stone-800 tracking-tight animate-pulse">
          Ano Pong <span className="text-red-600">Ulam?</span>
        </h2>

        {/* Progress Spinner */}
        <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mt-2" />
      </div>
    </div>
  )
}
