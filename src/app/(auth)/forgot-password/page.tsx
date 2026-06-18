"use client"

import { useState } from "react"
import Link from "next/link"
import { MdRestaurant, MdCheck, MdMail } from "react-icons/md"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

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
        <Link href="/" className="block text-center mb-8 text-2xl">
          <MdRestaurant className="inline-block" /> <span className="font-bold">Ano Pong <span className="text-red-600">Ulam?</span></span>
        </Link>

        {sent ? (
          <div className="bg-white rounded-xl border border-stone-200 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdCheck className="text-2xl text-green-600" />
            </div>
            <h1 className="text-xl font-bold mb-2">Check your email</h1>
            <p className="text-sm text-stone-500 mb-6">
              If an account with that email exists, we've sent a reset link. Check your inbox (and spam).
            </p>
            <p className="text-xs text-stone-400 mb-4">In development, check the server console for the link.</p>
            <Link href="/login" className="text-amber-600 text-sm font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h1 className="text-xl font-bold text-center">Forgot Password</h1>
            <p className="text-sm text-stone-500 text-center">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded">{error}</p>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <MdMail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-stone-300 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
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
