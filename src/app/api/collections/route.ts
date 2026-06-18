import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const checkRecipeId = url.searchParams.get("checkRecipeId")

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      emoji: true,
      recipeIds: true,
      createdAt: true,
    },
  })

  const result = collections.map((c) => ({
    id: Number(c.id),
    name: c.name,
    emoji: c.emoji,
    recipeCount: c.recipeIds.length,
    ...(checkRecipeId ? { hasRecipe: c.recipeIds.some((r) => r === BigInt(checkRecipeId)) } : {}),
    createdAt: c.createdAt,
  }))

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, emoji } = await req.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 })
    }

    const count = await prisma.collection.count({
      where: { userId: session.user.id },
    })

    if (count >= 50) {
      return NextResponse.json({ error: "Maximum of 50 collections reached" }, { status: 400 })
    }

    const collection = await prisma.collection.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        emoji: emoji || "📁",
      },
    })

    return NextResponse.json({
      id: Number(collection.id),
      name: collection.name,
      emoji: collection.emoji,
      recipeCount: 0,
    })
  } catch (error) {
    console.error("Create collection error:", error)
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 })
  }
}
