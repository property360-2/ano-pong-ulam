"use client"

import { useLanguage } from "@/lib/i18n"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLanguage("taglish")}
        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
          language === "taglish"
            ? "bg-red-600 text-white"
            : "text-stone-500 hover:text-stone-800 bg-stone-100"
        }`}
      >
        Taglish
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
          language === "en"
            ? "bg-red-600 text-white"
            : "text-stone-500 hover:text-stone-800 bg-stone-100"
        }`}
      >
        English
      </button>
    </div>
  )
}
