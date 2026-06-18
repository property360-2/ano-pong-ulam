import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      region: true,
      cookingLevel: true,
      avatarUrl: true,
      email: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { displayName, bio, region, cookingLevel, avatarUrl } = await req.json()

    if (cookingLevel && !["beginner", "home_cook", "lola_tier"].includes(cookingLevel)) {
      return NextResponse.json({ error: "Invalid cooking level" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName ?? undefined,
        bio: bio ?? undefined,
        region: region ?? undefined,
        cookingLevel: cookingLevel ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        region: true,
        cookingLevel: true,
        avatarUrl: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
