"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MdRestaurant } from "react-icons/md"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const username = form.get("username") as string
    const email = form.get("email") as string
    const password = form.get("password") as string

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Registration failed")
      setLoading(false)
      return
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Account created but sign in failed. Please log in.")
      setLoading(false)
    } else {
      router.push("/onboarding")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8 text-2xl">
          <MdRestaurant className="inline-block" /> <span className="font-bold">Ano Pong <span className="text-amber-600">Ulam?</span></span>
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <h1 className="text-xl font-bold text-center">Join the Community</h1>

          {error && (
            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2.5 rounded">{error}</p>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username <span className="text-stone-400">(@username)</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              pattern="^[a-zA-Z0-9_]+$"
              title="Letters, numbers, and underscores only"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-600 hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
