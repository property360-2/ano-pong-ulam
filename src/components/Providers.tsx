"use client"

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/lib/toast"
import { LanguageProvider } from "@/lib/i18n"
import type { ReactNode } from "react"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </LanguageProvider>
  )
}
