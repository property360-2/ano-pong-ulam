import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const session = await auth()
  const url = new URL(req.url)
  const tab = url.searchParams.get("tab") || "global"
  const cursor = url.searchParams.get("cursor")

  const take = 20

  let rawActivities = []

  if (tab === "following" && session?.user?.id) {
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    })
    const followingIds = following.map((f) => f.followingId)

    rawActivities = await prisma.activity.findMany({
      where: { userId: { in: followingIds } },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: BigInt(cursor) } } : {}),
      include: {
        recipe: { select: { slug: true, title: true, heroImage: true } },
      },
    })
  } else {
    rawActivities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: BigInt(cursor) } } : {}),
      include: {
        recipe: { select: { slug: true, title: true, heroImage: true } },
      },
    })
  }

  // Resolve user information in-memory to avoid missing schema relations
  const userIds = Array.from(
    new Set([
      ...rawActivities.map((a) => a.userId),
      ...rawActivities.filter((a) => a.type === "follow" && a.targetUserId).map((a) => a.targetUserId!),
    ])
  )
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  })
  
  const userMap = new Map(users.map((u) => [u.id, u]))

  const activities = rawActivities.map((act) => ({
    ...act,
    id: act.id.toString(), // Prevent JSON BigInt stringify issues
    targetRecipeId: act.targetRecipeId?.toString() || null,
    targetChallengeId: act.targetChallengeId?.toString() || null,
    user: userMap.get(act.userId) || null,
    targetUser: act.targetUserId ? userMap.get(act.targetUserId) : null,
  }))

  const nextCursor =
    rawActivities.length === take
      ? rawActivities[rawActivities.length - 1].id.toString()
      : null

  return NextResponse.json({ activities, nextCursor })
}
