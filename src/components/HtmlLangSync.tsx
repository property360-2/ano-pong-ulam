"use client"

import { useEffect } from "react"
import { useLanguage } from "@/lib/i18n"

export default function HtmlLangSync() {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.lang = language === "taglish" ? "fil" : "en"
  }, [language])

  return null
}
