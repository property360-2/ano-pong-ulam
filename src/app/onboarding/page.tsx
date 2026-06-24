"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { MdRestaurant, MdCheck } from "react-icons/md"
import { useToast } from "@/lib/toast"

const REGIONS = ["Luzon", "Visayas", "Mindanao", "Metro Manila", "Ilocos", "Bicol", "Western Visayas", "Central Visayas", "Davao"]
const COOKING_LEVELS = [
  { value: "beginner", label: "Beginner — Just starting out" },
  { value: "home_cook", label: "Home Cook — Family recipes pro" },
  { value: "lola_tier", label: "Lola Tier — Legendary status" },
]

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ displayName: "", bio: "", region: "", cookingLevel: "" })

  const steps = [
    {
      title: "Welcome to Ano Pong Ulam?",
      subtitle: "The community cookbook of Filipino recipes.",
    },
    {
      title: "Tell us about yourself",
      subtitle: "Set up your profile so others can get to know you.",
      fields: true,
    },
    {
      title: "You're all set!",
      subtitle: "Start exploring recipes shared by the community.",
    },
  ]

  async function saveProfile() {
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName || null,
          bio: form.bio || null,
          region: form.region || null,
          cookingLevel: form.cookingLevel || null,
        }),
      })
      if (res.ok) {
        toast.success("Profile saved!")
        update()
        router.push("/")
        router.refresh()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-stone-500">Loading...</p>
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-1 mb-12">
          {steps.map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step ? "bg-red-600 text-white" : "bg-stone-200 text-stone-400"
                }`}
              >
                {i < step ? <MdCheck /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-1 rounded transition-colors ${i < step ? "bg-red-600" : "bg-stone-200"}`} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="text-center">
            <MdRestaurant className="text-6xl text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{steps[0].title}</h1>
            <p className="text-stone-500 mb-8">{steps[0].subtitle}</p>
            <button
              onClick={() => setStep(1)}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold mb-2 text-center">{steps[1].title}</h1>
            <p className="text-stone-500 mb-6 text-center">{steps[1].subtitle}</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder={`@${session?.user?.name || "user"}`}
                  maxLength={50}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="What kind of cooking do you love?"
                  rows={3}
                  maxLength={300}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium mb-1">Region</label>
                <select
                  id="region"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select your region</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cookingLevel" className="block text-sm font-medium mb-1">Cooking Level</label>
                <select
                  id="cookingLevel"
                  value={form.cookingLevel}
                  onChange={(e) => setForm({ ...form, cookingLevel: e.target.value })}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select your level</option>
                  {COOKING_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 px-6 py-2.5 text-sm font-medium text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdCheck className="text-3xl text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{steps[2].title}</h1>
            <p className="text-stone-500 mb-8">{steps[2].subtitle}</p>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Start Cooking!"}
            </button>
          </div>
        )}
      </main>
  )
}
