import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const session = await auth()
  const url = new URL(req.url)
  const tab = url.searchParams.get("tab") || "global"
  const cursor = url.searchParams.get("cursor")

  const take = 20

  if (tab === "following" && session?.user?.id) {
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    })
    const followingIds = following.map((f) => f.followingId)

    const activities = await prisma.activity.findMany({
      where: { userId: { in: followingIds } },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: BigInt(cursor) } } : {}),
      include: {
        recipe: { select: { slug: true, title: true, heroImage: true } },
      },
    })

    return NextResponse.json({ activities, nextCursor: activities.length === take ? activities[activities.length - 1].id.toString() : null })
  }

  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: BigInt(cursor) } } : {}),
    include: {
      recipe: { select: { slug: true, title: true, heroImage: true } },
    },
  })

  return NextResponse.json({ activities, nextCursor: activities.length === take ? activities[activities.length - 1].id.toString() : null })
}
