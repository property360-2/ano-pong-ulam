"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MdLock, MdCameraAlt } from "react-icons/md"
import Header from "@/components/Header"

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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  const avatarPreview = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile)
    return null
  }, [avatarFile])

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

  async function handleChangePassword() {
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    setPasswordSaving(true)
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordSuccess("Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordError(data.error || "Failed to change password")
      }
    } catch {
      setPasswordError("Something went wrong")
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
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
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
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
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 text-sm" />
                <input
                  type="text"
                  value={`@${profile?.username || ""}`}
                  disabled
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2.5 pl-9 text-sm text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 text-sm" />
                <input
                  type="text"
                  value={profile?.email || ""}
                  disabled
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3 py-2.5 pl-9 text-sm text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-1">Display Name</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                defaultValue={profile?.displayName || ""}
                placeholder="Your display name"
                className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Avatar</label>
              <div className="flex items-center gap-4">
                <label className="relative w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-xl font-bold text-amber-600 flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-amber-500 transition-all group cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.displayName?.[0] || profile?.username[0] || "?").toUpperCase()
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MdCameraAlt className="text-white text-lg" />
                  </div>
                </label>
                <div className="text-xs text-stone-400">
                  <p>Click the avatar to upload a photo</p>
                  <p>Max 5MB. JPEG, PNG, WebP, or GIF.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-lg font-bold mb-4">About You</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  defaultValue={profile?.bio || ""}
                  placeholder="Tell the community about yourself..."
                  className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium mb-1">Region</label>
                <select
                  id="region"
                  name="region"
                  defaultValue={profile?.region || ""}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="home_cook">Home Cook</option>
                  <option value="lola_tier">Lola Tier</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-stone-100">
              <Link
                href="/"
                className="px-6 py-3 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>
        </form>

        <section className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mt-8">
          <h2 className="text-lg font-bold mb-1">Change Password</h2>
          <p className="text-sm text-stone-500 mb-6">Update your account password</p>

          {passwordError && (
            <p className="text-sm text-red-600 mb-4 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600 mb-4 bg-green-50 px-3 py-2 rounded-lg">{passwordSuccess}</p>
          )}

          <div className="space-y-4 max-w-md">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
              className="bg-stone-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-900 disabled:opacity-50 transition-colors"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </section>
      </main>
    </>
  )
}
