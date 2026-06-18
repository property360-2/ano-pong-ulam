"use client"

import { useState, useRef } from "react"
import { MdCloudUpload, MdClose, MdImage } from "react-icons/md"

type Props = {
  onFile: (file: File | null) => void
  currentImage?: string | null
  hint?: string
}

export default function DropZone({ onFile, currentImage, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File | null) {
    if (!file) {
      setPreview(null)
      onFile(null)
      return
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) return
    if (file.size > 5 * 1024 * 1024) return
    setPreview(URL.createObjectURL(file))
    onFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function clear() {
    setPreview(null)
    onFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const showImage = preview || currentImage

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
        className="hidden"
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragging
            ? "border-red-500 bg-amber-50"
            : showImage
              ? "border-stone-200 bg-stone-50"
              : "border-stone-300 hover:border-red-400 hover:bg-stone-50"
        }`}
      >
        {showImage ? (
          <>
            <img
              src={showImage}
              alt="Preview"
              className="mx-auto max-h-40 rounded-lg object-cover"
            />
            <p className="text-xs text-stone-400 mt-2">Click or drag to replace</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clear()
              }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-stone-100 text-stone-500"
            >
              <MdClose />
            </button>
          </>
        ) : (
          <div className="text-stone-400">
            <MdCloudUpload className="text-3xl mx-auto mb-2" />
            <p className="text-sm font-medium">Drop an image here, or click to browse</p>
            <p className="text-xs mt-1">{hint || "Max 5MB. JPEG, PNG, WebP, or GIF."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
