import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const collectionId = BigInt(id)

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true, recipeIds: true },
  })

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 })
  }

  if (collection.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { recipeId } = await req.json()
    if (!recipeId) {
      return NextResponse.json({ error: "recipeId is required" }, { status: 400 })
    }

    const rid = BigInt(recipeId)
    const exists = collection.recipeIds.some((r) => r === rid)

    if (exists) {
      await prisma.$queryRaw`
        UPDATE "Collection"
        SET "recipeIds" = array_remove("recipeIds", ${rid}::bigint)
        WHERE id = ${collectionId}
      `
    } else {
      await prisma.collection.update({
        where: { id: collectionId },
        data: { recipeIds: { push: rid } },
      })
    }

    const updated = await prisma.collection.findUniqueOrThrow({
      where: { id: collectionId },
      select: { recipeIds: true },
    })

    return NextResponse.json({
      added: !exists,
      removed: exists,
      recipeCount: updated.recipeIds.length,
    })
  } catch (error) {
    console.error("Toggle recipe collection error:", error)
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 })
  }
}
