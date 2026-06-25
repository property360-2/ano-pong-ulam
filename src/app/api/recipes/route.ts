/**
 * @file route.ts
 * @description API route for recipes. Provides GET method to search, filter, and fetch recipes
 * (including by comma-separated lists of IDs), and POST method to create new recipes.
 * Fits into the system as the central recipe data endpoint.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Prisma, $Enums } from "@/generated/prisma/client"

/**
 * Generates a URL-friendly slug from a text string.
 * 
 * @param {string} text - The input text to slugify.
 * @returns {string} The slugified string.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100)
}

/**
 * Retrieves a list of published recipes based on optional search query, category, region, difficulty, tag, or specific IDs.
 * Supports pagination (limit, offset) and sorting (popular, quickest, newest).
 * 
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<NextResponse>} JSON response containing the list of matched recipes, total count, and hasMore flag.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get("q")
  const category = url.searchParams.get("category")
  const region = url.searchParams.get("region")
  const difficulty = url.searchParams.get("difficulty")
  const tag = url.searchParams.get("tag")
  const sort = url.searchParams.get("sort")
  const ids = url.searchParams.get("ids")
  const offset = parseInt(url.searchParams.get("offset") || "0")
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "12"), 50)

  const filters: Prisma.RecipeWhereInput[] = []
  
  if (ids) {
    const idList = ids.split(",")
      .map(id => {
        try {
          return BigInt(id.trim())
        } catch {
          return null
        }
      })
      .filter((id): id is bigint => id !== null)
    if (idList.length > 0) {
      filters.push({
        id: { in: idList }
      })
    }
  }

  if (category) {
    if (category === "breakfast") {
      filters.push({
        OR: [
          { category: { contains: "breakfast", mode: "insensitive" } },
          { category: { contains: "almusal", mode: "insensitive" } },
        ]
      })
    } else if (category === "fiesta") {
      filters.push({
        OR: [
          { category: { contains: "fiesta", mode: "insensitive" } },
          { category: { contains: "pampasko", mode: "insensitive" } },
        ]
      })
    } else if (category === "vegetable") {
      filters.push({
        OR: [
          { category: { contains: "gulay", mode: "insensitive" } },
          { category: { contains: "vegetable", mode: "insensitive" } },
        ]
      })
    } else {
      filters.push({
        category: { contains: category, mode: "insensitive" }
      })
    }
  }
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

  if (sort === "random") {
    const ids = await prisma.recipe.findMany({
      where,
      select: { id: true },
    })
    const shuffled = [...ids]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const selectedIds = shuffled.slice(0, limit).map(r => r.id)

    const recipes = await prisma.recipe.findMany({
      where: { id: { in: selectedIds } },
      include: { author: { select: { username: true } } },
    })

    const recipeMap = new Map(recipes.map(r => [Number(r.id), r]))
    const ordered = selectedIds
      .map(id => recipeMap.get(Number(id)))
      .filter((r): r is NonNullable<typeof r> => r != null)

    return NextResponse.json({
      recipes: ordered.map((r) => ({ ...r, id: Number(r.id) })),
      total: ids.length,
      hasMore: false,
    })
  }

  let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: "desc" }
  if (sort === "popular") orderBy = { likes: { _count: "desc" } }
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
