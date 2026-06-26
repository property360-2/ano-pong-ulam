import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma } from "@/generated/prisma/client"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let existing: Record<string, unknown> | null = null

  try {
    const { recipeId, collectionId } = await req.json()
    if (!recipeId) {
      return NextResponse.json({ error: "Missing recipeId" }, { status: 400 })
    }

    existing = await prisma.recipeSave.findUnique({
      where: { userId_recipeId: { userId: session.user.id, recipeId: BigInt(recipeId) } },
    })

    if (existing) {
      await prisma.recipeSave.delete({
        where: { userId_recipeId: { userId: session.user.id, recipeId: BigInt(recipeId) } },
      })
      return NextResponse.json({ saved: false })
    }

    await prisma.recipeSave.create({
      data: {
        userId: session.user.id,
        recipeId: BigInt(recipeId),
        collectionId: collectionId ? BigInt(collectionId) : null,
      },
    })

    return NextResponse.json({ saved: true })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2002" || error.code === "P2025")
    ) {
      return NextResponse.json({ saved: !existing })
    }
    console.error("Save error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
