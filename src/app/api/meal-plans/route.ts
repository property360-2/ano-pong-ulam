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
    const { plan, groceryList, weekStartDate } = await req.json()
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
