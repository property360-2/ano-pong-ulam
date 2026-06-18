import { prisma } from "@/lib/db"

type NotificationType = "like" | "comment" | "follow" | "save"

export async function createNotification({
  type,
  recipientId,
  actorId,
  recipeId,
  message,
}: {
  type: NotificationType
  recipientId: string
  actorId: string | null
  recipeId?: bigint | number
  message: string
}) {
  if (recipientId === actorId) return

  try {
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type,
        actorId,
        targetRecipeId: recipeId ? BigInt(recipeId) : null,
        message,
      },
    })
  } catch (error) {
    console.error("Failed to create notification:", error)
  }
}

export async function createActivity({
  userId,
  type,
  recipeId,
  targetUserId,
}: {
  userId: string
  type: string
  recipeId?: bigint | number
  targetUserId?: string
}) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type,
        targetRecipeId: recipeId ? BigInt(recipeId) : null,
        targetUserId,
      },
    })
  } catch (error) {
    console.error("Failed to create activity:", error)
  }
}
