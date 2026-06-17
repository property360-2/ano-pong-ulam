import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

type Params = Promise<{ id: string }>

export async function GET(_req: Request, props: { params: Params }) {
  const { id } = await props.params

  const challenge = await prisma.challenge.findUnique({
    where: { id: BigInt(id) },
    include: {
      entries: {
        orderBy: { voteCount: "desc" },
        include: {
          user: { select: { username: true, avatarUrl: true } },
          recipe: { select: { slug: true, title: true } },
        },
      },
      _count: { select: { entries: true } },
    },
  })

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }

  return NextResponse.json(challenge)
}
