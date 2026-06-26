"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import en from "@/locales/en.json"
import taglish from "@/locales/taglish.json"

/**
 * i18n Translation & Localization Provider
 * Purpose: Handles dictionary lookup, current language state, and translation hooks.
 * What it contains: LanguageProvider, useLanguage, and translation functions.
 * How it fits: Wrapped around the root of the app to allow multi-language support.
 */

type Language = "en" | "taglish"
type Dict = Record<string, string>

const DICTIONARIES: Record<Language, Dict> = { en, taglish }

const DEFAULT_LANGUAGE: Language = "en"

const STORAGE_KEY = "lang"

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === "en" || stored === "taglish") return stored
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguageState(getInitialLanguage())
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch { /* localStorage unavailable */ }
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dict = DICTIONARIES[language]
      let value = dict[key]
      if (value === undefined) {
        value = DICTIONARIES.en[key]
      }
      if (value === undefined) {
        return key
      }
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replace(`{${k}}`, String(v))
        }
      }
      return value
    },
    [language],
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return ctx
}
