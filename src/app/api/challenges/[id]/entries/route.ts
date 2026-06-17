import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

type Params = Promise<{ id: string }>

export async function POST(req: Request, props: { params: Params }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await props.params

  try {
    const body = await req.json()
    const { recipeId, photoUrl, caption } = body

    if (!photoUrl) {
      return NextResponse.json({ error: "Photo is required" }, { status: 400 })
    }

    const entry = await prisma.challengeEntry.create({
      data: {
        challengeId: BigInt(id),
        userId: session.user.id,
        recipeId: recipeId ? BigInt(recipeId) : null,
        photoUrl,
        caption: caption || null,
      },
      include: {
        user: { select: { username: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Already entered this challenge" }, { status: 409 })
    }
    console.error("Challenge entry error:", error)
    return NextResponse.json({ error: "Failed to enter challenge" }, { status: 500 })
  }
}
