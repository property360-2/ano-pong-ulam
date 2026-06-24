/**
 * @file page.tsx
 * @description Sign In client page component. Users can log in using their registered
 * email address and password, or authenticate using Google OAuth. It integrates with Next-Auth
 * client side providers to authenticate sessions and redirects to the home page on success.
 */

"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { FcGoogle } from "react-icons/fc"

/**
 * LoginPage component.
 * Renders a credential login form along with a Google Sign In option. On submit, it attempts to
 * authenticate the user via Next-Auth and triggers client-side state/routing updates. Includes a post fallback
 * method on the form to prevent credentials leak in case JavaScript is not hydrated.
 * 
 * @returns {JSX.Element} The login form page view.
 */
export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  /**
   * Handles submission of the login form using Next-Auth credentials provider.
   * 
   * @param {React.FormEvent<HTMLFormElement>} e - React form submit event object.
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const email = form.get("email") as string
    const password = form.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      console.error("Credentials sign in error:", err)
      setError("An unexpected error occurred during sign in")
      setLoading(false)
    }
  }

  /**
   * Handles triggering the Google OAuth sign in flow.
   */
  async function handleGoogleSignIn() {
    setLoading(true)
    setError("")
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      console.error("Google sign in error:", err)
      setError("Failed to sign in with Google")
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

        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
          <h1 className="text-xl font-bold text-center">Sign In</h1>

          {error && (
            <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2.5 rounded">{error}</p>
          )}

          <form onSubmit={handleSubmit} method="POST" className="space-y-4">
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
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 text-stone-400 text-xs font-semibold uppercase">Or</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 py-2.5 rounded-lg font-medium hover:bg-stone-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <FcGoogle className="text-lg" />
            {loading ? "Connecting..." : "Sign In with Google"}
          </button>

          <div className="flex justify-between text-sm pt-2">
            <Link href="/forgot-password" className="text-amber-600 hover:underline">Forgot password?</Link>
            <Link href="/register" className="text-amber-600 hover:underline">Register</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
