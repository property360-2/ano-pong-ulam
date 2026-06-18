/**
 * /api/upload (POST)
 * Uploads a recipe hero image or user avatar to Supabase Storage.
 *
 * Accepts: multipart/form-data with fields:
 *   - file: File (required, max 5MB, JPEG/PNG/WebP/GIF)
 *   - folder: string (optional, defaults to "recipe-images")
 *
 * Returns: { url: string } on success, or { error: string } on failure.
 *
 * Flow:
 *   1. Authenticate the user via NextAuth session
 *   2. Validate file type and size
 *   3. Ensure the target Supabase Storage bucket exists
 *   4. Upload with a unique path scoped to the user
 *   5. Return the public URL
 *
 * TODO: Add user avatar upload support (folder: "avatars")
 */
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-admin"

const BUCKET_NAME = "recipe-images"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export async function POST(request: Request) {
  try {
    // NOTE: Auth check — only signed-in users can upload
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "recipe-images"

    // NOTE: Validate file presence
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // NOTE: Validate file type against whitelist
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 },
      )
    }

    // NOTE: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 5MB." },
        { status: 400 },
      )
    }

    const bucketName = BUCKET_NAME

    // TODO: Ensure bucket exists — first request creates it
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    if (!buckets?.find((b) => b.name === bucketName)) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
      })
      if (createError) {
        console.error("Bucket creation error:", createError)
        return NextResponse.json({ error: "Storage setup failed" }, { status: 500 })
      }
    }

    // NOTE: Generate a unique, non-guessable filename scoped to the user and folder
    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `${folder}/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // NOTE: Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucketName).getPublicUrl(uploadData.path)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Upload handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
