import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

// NOTE: Prisma BigInt fields (e.g. Recipe.id, Comment.id) are not serializable
// by JSON.stringify. This polyfill ensures all BigInt values are converted to
// strings when passed through NextResponse.json or any JSON serialization.
// TODO: remove this if Prisma migrates to number-based IDs
// eslint-disable-next-line no-extend-native
;(BigInt.prototype as unknown as Record<string, unknown>).toJSON = function () {
  return this.toString()
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
