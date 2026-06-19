/**
 * @file db.ts
 * @description Provides a single, global PrismaClient instance configured with the PostgreSQL (pg) adapter.
 * It sets up a database connection pool using the pg package and handles BigInt serialization polyfills
 * to prevent JSON serialization errors for database models using BigInt identifiers.
 * This file is crucial for enabling unified database access across all API routes and Server Components.
 */

import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

// NOTE: Prisma BigInt fields (e.g. Recipe.id, Comment.id) are not serializable
// by JSON.stringify. This polyfill ensures all BigInt values are converted to
// strings when passed through NextResponse.json or any JSON serialization.
// TODO: remove this if Prisma migrates to number-based IDs
// eslint-disable-next-line no-extend-native
;(BigInt.prototype as unknown as Record<string, unknown>).toJSON = function () {
  return this.toString()
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * Creates and configures a new PrismaClient instance.
 * It initializes a pg.Pool connection pool using the DATABASE_URL environment variable,
 * binds it to the PrismaPg adapter, and instantiates the PrismaClient with this adapter.
 * 
 * @returns {PrismaClient} A configured PrismaClient instance.
 */
function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

