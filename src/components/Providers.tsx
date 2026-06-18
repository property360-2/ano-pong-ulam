"use client"

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/lib/toast"
import type { ReactNode } from "react"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}
