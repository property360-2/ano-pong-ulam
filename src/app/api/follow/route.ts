import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { targetUserId } = await req.json()
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 })
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
    })

    if (existing) {
      await prisma.follow.delete({
        where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
      })
      return NextResponse.json({ following: false })
    }

    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: targetUserId },
    })

    return NextResponse.json({ following: true })
  } catch (error) {
    console.error("Follow error:", error)
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 })
  }
}
