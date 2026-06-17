import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { recipeId, content, parentId } = await req.json()
    if (!recipeId || !content?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        recipeId: BigInt(recipeId),
        userId: session.user.id,
        content: content.trim(),
        parentId: parentId ? BigInt(parentId) : null,
      },
      include: { user: { select: { username: true, avatarUrl: true } } },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to comment" }, { status: 500 })
  }
}
