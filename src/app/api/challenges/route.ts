import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const challenges = await prisma.challenge.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { entries: true } } },
  })

  return NextResponse.json(challenges)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, emoji, startDate, endDate, themeTags, prize } = body

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description: description || null,
        emoji: emoji || "🍲",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        themeTags: themeTags || [],
        prize: prize || null,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    console.error("Create challenge error:", error)
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}
