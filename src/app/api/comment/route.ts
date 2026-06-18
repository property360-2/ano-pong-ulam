import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createNotification, createActivity } from "@/lib/notifications"

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

    const recipe = await prisma.recipe.findUnique({
      where: { id: BigInt(recipeId) },
      select: { authorId: true, title: true },
    })

    if (recipe?.authorId) {
      createNotification({
        type: "comment",
        recipientId: recipe.authorId,
        actorId: session.user.id,
        recipeId: BigInt(recipeId),
        message: `commented on "${recipe.title}": "${content.trim().slice(0, 50)}${content.trim().length > 50 ? "..." : ""}"`,
      })
    }

    createActivity({
      userId: session.user.id,
      type: "comment",
      recipeId: BigInt(recipeId),
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to comment" }, { status: 500 })
  }
}
