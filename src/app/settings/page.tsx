"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import DropZone from "@/components/DropZone"

type UserProfile = {
  username: string
  displayName: string | null
  bio: string | null
  region: string | null
  cookingLevel: string | null
  avatarUrl: string | null
  email: string
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!session) return
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setProfile(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load profile")
        setLoading(false)
      })
  }, [session])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      let avatarUrl = profile?.avatarUrl || null

      if (avatarFile) {
        const uploadForm = new FormData()
        uploadForm.set("file", avatarFile)
        uploadForm.set("folder", "avatars")

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        })

        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          throw new Error(err.error || "Failed to upload avatar")
        }

        const { url } = await uploadRes.json()
        avatarUrl = url
      }

      const form = e.currentTarget
      const formData = new FormData(form)

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: (formData.get("displayName") as string) || null,
          bio: (formData.get("bio") as string) || null,
          region: (formData.get("region") as string) || null,
          cookingLevel: (formData.get("cookingLevel") as string) || null,
          avatarUrl,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save profile")
      }

      setSuccess(true)
      updateSession()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">Sign in to manage settings</h1>
            <Link
              href="/login"
              className="inline-block bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-dark transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-stone-500">Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-stone-500 mb-8">Manage your profile and preferences.</p>

        {error && (
          <div className="bg-amber-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
            Profile saved successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-lg font-bold">Profile</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <p className="text-sm text-stone-500">@{profile?.username}</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <p className="text-sm text-stone-500">{profile?.email}</p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-1">Display Name</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                defaultValue={profile?.displayName || ""}
                placeholder="Your display name"
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Avatar</label>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-xl font-bold text-amber-600 flex-shrink-0 overflow-hidden">
                  {profile?.avatarUrl && !avatarFile ? (
                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.displayName?.[0] || profile?.username[0] || "?").toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <DropZone onFile={setAvatarFile} currentImage={null} hint="Max 5MB. JPEG, PNG, WebP, or GIF." />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-lg font-bold">About You</h2>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                defaultValue={profile?.bio || ""}
                placeholder="Tell the community about yourself..."
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium mb-1">Region</label>
              <select
                id="region"
                name="region"
                defaultValue={profile?.region || ""}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Prefer not to say</option>
                <option value="tagalog">Tagalog</option>
                <option value="bicol">Bicol</option>
                <option value="ilocano">Ilocano</option>
                <option value="kapampangan">Kapampangan</option>
                <option value="visayas">Visayas</option>
                <option value="mindanao">Mindanao</option>
                <option value="diaspora">Diaspora / International</option>
              </select>
            </div>

            <div>
              <label htmlFor="cookingLevel" className="block text-sm font-medium mb-1">Cooking Level</label>
              <select
                id="cookingLevel"
                name="cookingLevel"
                defaultValue={profile?.cookingLevel || ""}
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="home_cook">Home Cook</option>
                <option value="lola_tier">Lola Tier</option>
              </select>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/"
              className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-dark disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
