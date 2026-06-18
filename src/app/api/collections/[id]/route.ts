import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const collectionId = BigInt(id)

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      name: true,
      emoji: true,
      description: true,
      recipeIds: true,
      userId: true,
    },
  })

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 })
  }

  if (collection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: collection.recipeIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      heroImage: true,
      description: true,
      author: { select: { username: true } },
    },
  })

  return NextResponse.json({
    id: Number(collection.id),
    name: collection.name,
    emoji: collection.emoji,
    description: collection.description,
    recipeCount: collection.recipeIds.length,
    recipes: recipes.map((r) => ({ ...r, id: Number(r.id) })),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const collectionId = BigInt(id)

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  })

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 })
  }

  if (collection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { name, emoji } = await req.json()
    const data: Record<string, string> = {}

    if (name?.trim()) data.name = name.trim()
    if (emoji) data.emoji = emoji

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data,
    })

    return NextResponse.json({
      id: Number(updated.id),
      name: updated.name,
      emoji: updated.emoji,
    })
  } catch (error) {
    console.error("Update collection error:", error)
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const collectionId = BigInt(id)

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  })

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 })
  }

  if (collection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await prisma.collection.delete({ where: { id: collectionId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete collection error:", error)
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 })
  }
}
