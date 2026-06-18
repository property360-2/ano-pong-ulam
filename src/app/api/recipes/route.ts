import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma, $Enums } from "@/generated/prisma/client"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get("q")
  const category = url.searchParams.get("category")
  const region = url.searchParams.get("region")
  const difficulty = url.searchParams.get("difficulty")
  const tag = url.searchParams.get("tag")
  const sort = url.searchParams.get("sort")
  const offset = parseInt(url.searchParams.get("offset") || "0")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "12"), 50)

  const filters: Prisma.RecipeWhereInput[] = []
  if (category) filters.push({ category })
  if (region) filters.push({ region })
  if (difficulty) filters.push({ difficulty: difficulty as $Enums.Difficulty })
  if (tag) filters.push({ tags: { has: tag } })
  if (q) {
    filters.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    })
  }

  const where: Prisma.RecipeWhereInput = { isPublished: true }
  if (filters.length > 0) where.AND = filters

  let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: "desc" }
  if (sort === "popular") orderBy = { cookCount: "desc" }
  else if (sort === "quickest") orderBy = { cookTime: "asc" }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: { author: { select: { username: true } } },
      orderBy,
      skip: offset,
      take: limit,
    }),
    prisma.recipe.count({ where }),
  ])

  return NextResponse.json({
    recipes: recipes.map((r) => ({ ...r, id: Number(r.id) })),
    total,
    hasMore: offset + limit < total,
  })
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
