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
;(BigInt.prototype as unknown as Record<string, unknown>).toJSON = function () {
  return this.toString()
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pgPool?: Pool
}

/**
 * Creates and configures a new PrismaClient instance.
 * It initializes or retrieves a cached pg.Pool connection pool using the DATABASE_URL environment variable.
 * Caching the pg.Pool globally prevents creating new connection pools and leaking database connections
 * during hot-reloads in development mode.
 * In development, we also limit the maximum connections to 2 to prevent hitting Supabase's session pooler limits.
 * It then binds the pool to the PrismaPg adapter and instantiates the PrismaClient.
 * 
 * @returns {PrismaClient} A configured PrismaClient instance.
 */
function createPrismaClient(): PrismaClient {
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      max: process.env.NODE_ENV === "production" ? undefined : 2,
    })
  }
  const adapter = new PrismaPg(globalForPrisma.pgPool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

