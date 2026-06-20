/**
 * @file page.tsx
 * @description Forgot password client page component. Users can input their email
 * to request a password reset link. It hits the api/auth/forgot-password route
 * and sends an email containing the secure password reset token.
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MdCheck } from "react-icons/md"

/**
 * ForgotPasswordPage component.
 * Renders a form where users submit their email address to request a password reset token.
 * Prevents native form submission via JavaScript while incorporating a POST fallback
 * attribute on the form element for added security.
 * 
 * @returns {JSX.Element} The password reset request view.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  /**
   * Handles submission of the password reset request.
   * 
   * @param {React.FormEvent} e - React form submit event object.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || "Something went wrong")
      }
    } catch {
      setError("Failed to send request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8">
          <Image src="/logo-no-bg.png" alt="" width={96} height={96} className="inline-block mb-2" />
          <div className="font-bold text-2xl">Ano Pong <span className="text-amber-600">Ulam?</span></div>
        </Link>

        {sent ? (
          <div className="bg-white rounded-xl border border-stone-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdCheck className="text-2xl text-green-600" />
            </div>
            <h1 className="text-xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-stone-500 mb-6">
              If an account with that email exists, we&apos;ve sent a reset link. Check your inbox (and spam).
            </p>
            <p className="text-xs text-stone-400 mb-4">In development, check the server console for the link.</p>
            <Link href="/login" className="text-amber-600 text-sm font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} method="POST" className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h1 className="text-xl font-bold text-center">Forgot Password</h1>
            <p className="text-sm text-stone-500 text-center">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded">{error}</p>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-stone-500">
              Remember your password?{" "}
              <Link href="/login" className="text-amber-600 hover:underline">Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
