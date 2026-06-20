/**
 * @file route.ts
 * @description API route handlers for submitting, retrieving, and deleting user feedback.
 * Provides public POST access for authenticated and guest users, while restricting
 * GET and DELETE operations exclusively to the admin user (username defined by ADMIN_USERNAME).
 * Fits into the system as the backend controller for feedback-related database operations.
 */

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "property360"
const VALID_CATEGORIES = ["bug", "feature", "recipe", "other"]

/**
 * GET handler.
 * Fetches all submitted feedbacks from the database, ordered by creation date descending.
 * Restricts access to the admin user only.
 * 
 * @returns {Promise<NextResponse>} JSON response containing list of feedbacks or error message.
 */
export async function GET() {
  try {
    const session = await auth()
    
    // Check if user is authenticated and authorized as admin
    if (!session?.user?.name || session.user.name !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: "Access denied. Admin authorization required." },
        { status: 403 }
      )
    }

    // Retrieve feedbacks with associated user details
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(feedbacks, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/feedback:", error)
    return NextResponse.json(
      { error: "Failed to retrieve feedback. Please try again later." },
      { status: 500 }
    )
  }
}

/**
 * POST handler.
 * Creates a new feedback entry in the database.
 * Accepts category and message. Attaches the current user's ID if authenticated.
 * 
 * @param {Request} req The incoming HTTP request.
 * @returns {Promise<NextResponse>} JSON response containing the created feedback or error message.
 */
export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()

    // Validate request body existence
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      )
    }

    const { category, message } = body

    // Validate and sanitize category input
    if (!category || typeof category !== "string" || !VALID_CATEGORIES.includes(category.trim())) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate and sanitize message input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback message cannot be empty." },
        { status: 400 }
      )
    }

    if (message.trim().length > 1000) {
      return NextResponse.json(
        { error: "Feedback message cannot exceed 1000 characters." },
        { status: 400 }
      )
    }

    const sanitizedCategory = category.trim()
    const sanitizedMessage = message.trim()

    // Save feedback to the database
    const feedback = await prisma.feedback.create({
      data: {
        category: sanitizedCategory,
        message: sanitizedMessage,
        userId: session?.user?.id || null, // Allow anonymous or guest feedback, but attach userId if authenticated
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/feedback:", error)
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again later." },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler.
 * Deletes a specific feedback entry by its ID.
 * Restricts access to the admin user only.
 * 
 * @param {Request} req The incoming HTTP request containing the feedback ID in the body.
 * @returns {Promise<NextResponse>} JSON response indicating success or error message.
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth()

    // Check if user is authenticated and authorized as admin
    if (!session?.user?.name || session.user.name !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: "Access denied. Admin authorization required." },
        { status: 403 }
      )
    }

    const body = await req.json()
    if (!body || typeof body !== "object" || !body.id || typeof body.id !== "string") {
      return NextResponse.json(
        { error: "Invalid feedback ID." },
        { status: 400 }
      )
    }

    const { id } = body

    // Check if the feedback entry exists before attempting deletion
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id },
    })

    if (!existingFeedback) {
      return NextResponse.json(
        { error: "Feedback entry not found." },
        { status: 404 }
      )
    }

    // Delete feedback entry from the database
    await prisma.feedback.delete({
      where: { id },
    })

    return NextResponse.json(
      { success: true, message: "Feedback entry deleted successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in DELETE /api/feedback:", error)
    return NextResponse.json(
      { error: "Failed to delete feedback entry. Please try again later." },
      { status: 500 }
    )
  }
}
