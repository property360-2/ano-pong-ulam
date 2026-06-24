import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as dotenv from "dotenv"

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const categories = await prisma.recipe.groupBy({
    by: ["category"],
    _count: true,
    orderBy: { _count: { category: "desc" } }
  })
  
  console.log("Categories in Database:")
  console.log(JSON.stringify(categories, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
