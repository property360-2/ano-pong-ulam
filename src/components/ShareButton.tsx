"use client"

import { useState, useRef, useEffect } from "react"
import { MdShare, MdFacebook, MdLink, MdCheck } from "react-icons/md"
import { useToast } from "@/lib/toast"

export default function ShareButton({ slug, title }: { slug: string; title: string }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fullUrl = origin ? `${origin}/recipes/${slug}` : `/recipes/${slug}`
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      toast.success("Link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
    setOpen(false)
  }

  function shareFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer,width=600,height=400")
    setOpen(false)
  }

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank", "noopener,noreferrer,width=600,height=400")
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 transition-colors"
        title="Share"
      >
        <MdShare className="text-lg" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-card border border-stone-200 p-1.5">
          <button
            onClick={shareFacebook}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <MdFacebook className="text-lg text-blue-600" />
            Facebook
          </button>
          <button
            onClick={shareTwitter}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X (Twitter)
          </button>
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            {copied ? <MdCheck className="text-lg text-green-600" /> : <MdLink className="text-lg text-stone-500" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      )}
    </div>
  )
}
