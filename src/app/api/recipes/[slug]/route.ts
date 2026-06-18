import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(req: Request, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existing = await prisma.recipe.findUnique({ where: { slug }, select: { authorId: true } })
    if (!existing) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }
    if (existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own recipes" }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      description,
      story,
      category,
      region,
      difficulty,
      prepTime,
      cookTime,
      servings,
      ingredients,
      steps,
      tags,
      heroImage,
    } = body

    if (!title || !category || !ingredients?.length || !steps?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const recipe = await prisma.recipe.update({
      where: { slug },
      data: {
        title,
        description: description || null,
        story: story || null,
        category,
        region: region || null,
        difficulty: difficulty || null,
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        servings: servings || 4,
        heroImage: heroImage || null,
        ingredients,
        steps,
        tags: tags || [],
      },
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Update recipe error:", error)
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 })
  }
}
