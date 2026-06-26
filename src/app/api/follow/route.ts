import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@/generated/prisma/client"
import { createNotification, createActivity } from "@/lib/notifications"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let existing: Record<string, unknown> | null = null

  try {
    const { targetUserId } = await req.json()
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 })
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    existing = await prisma.follow.findUnique({
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

    createNotification({
      type: "follow",
      recipientId: targetUserId,
      actorId: session.user.id,
      message: "started following you",
    })

    createActivity({
      userId: session.user.id,
      type: "follow",
      targetUserId,
    })

    return NextResponse.json({ following: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2002" || error.code === "P2025")
    ) {
      return NextResponse.json({ following: !existing })
    }
    console.error("Follow error:", error)
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 })
  }
}
