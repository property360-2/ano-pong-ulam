import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import SessionProvider from "@/components/SessionProvider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Ano Pong Ulam?",
    template: "%s — Ano Pong Ulam?",
  },
  description:
    "Mga recipe ng pamilya, pinagbabahagi ng bayan. Discover Filipino family recipes, share your lola's secret dishes, and cook along with the community.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
}

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
