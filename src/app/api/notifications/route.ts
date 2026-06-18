import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const tab = url.searchParams.get("tab") || "all"

  const take = 50
  const includeActor = { select: { id: true, username: true, avatarUrl: true } }

  if (tab === "unread") {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id, isRead: false },
        orderBy: { createdAt: "desc" },
        take,
      }),
      prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ])
    return NextResponse.json({ notifications, unreadCount })
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take,
    }),
    prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { notificationId, markAll } = await req.json()

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      const notification = await prisma.notification.findUnique({
        where: { id: BigInt(notificationId) },
        select: { userId: true },
      })
      if (notification && notification.userId === session.user.id) {
        await prisma.notification.update({
          where: { id: BigInt(notificationId) },
          data: { isRead: true },
        })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
