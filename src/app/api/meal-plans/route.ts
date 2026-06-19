import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const weekStart = getWeekStart()
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { userId_weekStartDate: { userId: session.user.id, weekStartDate: weekStart } },
  })

  return NextResponse.json(mealPlan || { plan: {}, weekStart })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { plan, groceryList, weekStartDate } = body

    // Validate plan structure
    if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
      return NextResponse.json({ error: "Invalid plan: must be an object" }, { status: 400 })
    }
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const validMeals = ["breakfast", "lunch", "dinner"]
    for (const [day, meals] of Object.entries(plan)) {
      if (!validDays.includes(day)) {
        return NextResponse.json({ error: `Invalid day: ${day}` }, { status: 400 })
      }
      if (meals && typeof meals === "object") {
        for (const [meal, value] of Object.entries(meals as Record<string, unknown>)) {
          if (!validMeals.includes(meal)) {
            return NextResponse.json({ error: `Invalid meal: ${meal}` }, { status: 400 })
          }
          if (value !== undefined && value !== null && typeof value !== "number") {
            return NextResponse.json({ error: `Invalid recipe ID for ${day} ${meal}` }, { status: 400 })
          }
        }
      }
    }

    const weekStart = weekStartDate ? new Date(weekStartDate) : getWeekStart()

    const mealPlan = await prisma.mealPlan.upsert({
      where: { userId_weekStartDate: { userId: session.user.id, weekStartDate: weekStart } },
      update: { plan, groceryList: groceryList || null },
      create: {
        userId: session.user.id,
        weekStartDate: weekStart,
        plan,
        groceryList: groceryList || null,
      },
    })

    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error("Meal plan error:", error)
    return NextResponse.json({ error: "Failed to save meal plan" }, { status: 500 })
  }
}
