import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createResetToken } from "@/lib/reset-token"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true },
    })

    if (!user) {
      return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent" })
    }

    if (!user.email) {
      return NextResponse.json({ error: "Cannot reset password for OAuth-only accounts" }, { status: 400 })
    }

    const token = createResetToken(user.id)

    const resetUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/reset-password?token=${token}`

    console.log("")
    console.log("═══════════════════════════════════════════")
    console.log("  PASSWORD RESET LINK")
    console.log(`  For: ${user.email} (@${user.username})`)
    console.log(`  URL: ${resetUrl}`)
    console.log("  Expires: 1 hour")
    console.log("═══════════════════════════════════════════")
    console.log("")

    return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
