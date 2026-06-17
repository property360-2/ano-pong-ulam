import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
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

    let slug = slugify(title)
    const existing = await prisma.recipe.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const recipe = await prisma.recipe.create({
      data: {
        slug,
        title,
        description: description || null,
        story: story || null,
        category,
        region: region || null,
        difficulty: difficulty || null,
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        servings: servings || 4,
        ingredients,
        steps,
        tags: tags || [],
        heroImage: heroImage || null,
        authorId: session.user.id,
        sourceType: "community",
      },
    })

    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error("Create recipe error:", error)
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 })
  }
}
