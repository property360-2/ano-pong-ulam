/**
 * @file page.tsx
 * @description Page component for submitting feedback. Displays a form with category selection,
 * message input, character counter, error handling, and a styled success page upon submission.
 * Fits into the broader system as the user-facing entry point for gathering feedback.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { MdArrowBack, MdCheckCircle, MdSend } from "react-icons/md"
import { useToast } from "@/lib/toast"

interface FeedbackFormState {
  category: string
  message: string
}

/**
 * FeedbackPage component.
 * Renders the feedback submission form page.
 * Handles input change validation, category selection, text length constraints,
 * submission payload to /api/feedback, and visual success/failure states.
 * 
 * @returns {JSX.Element} The rendered Feedback form page.
 */
export default function FeedbackPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [form, setForm] = useState<FeedbackFormState>({
    category: "bug",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const maxChars = 1000

  /**
   * Handles input changes in the text field.
   * Restricts message length to the defined maximum character limit.
   * 
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e The text area change event.
   */
  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    if (val.length <= maxChars) {
      setForm((prev) => ({ ...prev, message: val }))
    }
  }

  /**
   * Handles dropdown selection changes.
   * 
   * @param {React.ChangeEvent<HTMLSelectElement>} e The select change event.
   */
  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, category: e.target.value }))
  }

  /**
   * Submits the form data to the backend API.
   * Validates state, triggers loading indicator, and renders success/error dialogs.
   * 
   * @param {React.FormEvent} e The form submission event.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.message.trim()) {
      toast.error("Please enter a message.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: form.category,
          message: form.message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.")
      }

      setSubmitted(true)
      toast.success("Feedback submitted successfully!")
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred."
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-stone-50 py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <MdCheckCircle className="text-emerald-500 text-6xl mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Thank you!</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">
            Your feedback has been successfully submitted. We appreciate your help in making <strong>Ano Pong Ulam?</strong> better.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setForm({ category: "bug", message: "" })
                setSubmitted(false)
              }}
              className="w-full bg-stone-100 text-stone-700 hover:bg-stone-200 py-3 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px]"
            >
              Submit Another Response
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-red-600 text-white hover:bg-red-700 py-3 px-4 rounded-xl text-sm font-medium transition-all shadow-sm min-h-[44px]"
            >
              Go to Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-stone-50 py-12 px-4">
      <div className="mx-auto max-w-lg">
        {/* Back Navigation Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-6 text-sm font-medium min-h-[44px]"
        >
          <MdArrowBack className="text-lg" />
          Go Back
        </button>

        {/* Feedback Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Share your Feedback</h1>
          <p className="text-sm text-stone-500 mb-8 leading-relaxed">
            Encountered a bug? Have an idea for a new feature? Or want to suggest a local recipe? Tell us about it below!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Field */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={handleCategoryChange}
                disabled={loading}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer min-h-[44px]"
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="recipe">Recipe Suggestion</option>
                <option value="other">Other Feedback</option>
              </select>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="message" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Your Message
                </label>
                <span className={`text-xs ${form.message.length >= maxChars ? "text-red-500 font-medium" : "text-stone-400"}`}>
                  {form.message.length} / {maxChars}
                </span>
              </div>
              <textarea
                id="message"
                value={form.message}
                onChange={handleMessageChange}
                disabled={loading}
                placeholder={
                  form.category === "bug"
                    ? "Please describe what happened, what you expected, and steps to reproduce the bug..."
                    : form.category === "recipe"
                    ? "Which Filipino recipe would you like to see? You can list its name, region, or ingredients..."
                    : "Tell us how we can make your kitchen experience better..."
                }
                rows={6}
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-stone-50 text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !form.message.trim()}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-stone-200 disabled:text-stone-400 py-3 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm min-h-[44px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
              ) : (
                <>
                  <MdSend className="text-base" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
