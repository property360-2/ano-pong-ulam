import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { recipeId } = await req.json()
    if (!recipeId) {
      return NextResponse.json({ error: "Missing recipeId" }, { status: 400 })
    }

    const existing = await prisma.recipeLike.findUnique({
      where: { userId_recipeId: { userId: session.user.id, recipeId: BigInt(recipeId) } },
    })

    if (existing) {
      await prisma.recipeLike.delete({
        where: { userId_recipeId: { userId: session.user.id, recipeId: BigInt(recipeId) } },
      })
      return NextResponse.json({ liked: false })
    }

    await prisma.recipeLike.create({
      data: { userId: session.user.id, recipeId: BigInt(recipeId) },
    })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like" }, { status: 500 })
  }
}
