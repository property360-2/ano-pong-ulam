/**
 * @file page.tsx
 * @description Reset Password client page component. Users arrive here via a link from their email
 * to specify their new password. Wrapped with a Suspense boundary for search params decoding.
 */

"use client"

import { Suspense } from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MdRestaurant, MdCheck, MdLock } from "react-icons/md"

/**
 * ResetForm component.
 * Renders password input elements, verifies validation, and sends request to server.
 * 
 * @returns {JSX.Element} The rendered reset form component.
 */
function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <MdLock className="text-5xl text-stone-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Invalid Link</h1>
        <p className="text-sm text-stone-500 mb-6">This reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="text-amber-600 text-sm font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdCheck className="text-2xl text-green-600" />
        </div>
        <h1 className="text-xl font-bold mb-2">Password Reset!</h1>
        <p className="text-sm text-stone-500 mb-6">Your password has been updated successfully.</p>
        <Link
          href="/login"
          className="inline-block bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold text-center">Set New Password</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded">{error}</p>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">New Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="w-full bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  )
}

/**
 * ResetPasswordPage component.
 * Wrapper container layout hosting the ResetForm inside a Suspense boundary.
 * 
 * @returns {JSX.Element} The rendered reset password page container.
 */
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8 text-2xl">
          <MdRestaurant className="inline-block" /> <span className="font-bold">Ano Pong <span className="text-red-600">Ulam?</span></span>
        </Link>
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <Suspense fallback={<p className="text-sm text-stone-400 text-center">Loading...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
