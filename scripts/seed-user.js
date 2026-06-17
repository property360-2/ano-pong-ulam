require("dotenv").config()
const bcrypt = require("bcryptjs")
const { Client } = require("pg")

async function createTestUser() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log("Connected")

  const hash = await bcrypt.hash("test123456", 12)

  const existing = await client.query('SELECT id FROM "User" WHERE username = $1', ["testcook"])
  if (existing.rows.length > 0) {
    console.log("Test user already exists:", existing.rows[0].id)
  } else {
    await client.query(
      'INSERT INTO "User" (id, email, username, "displayName", "passwordHash", "isOnboarded", region, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, true, $5, NOW(), NOW())',
      ["test@anopongulam.ph", "testcook", "Maria", hash, "Cavite"]
    )
    console.log('Test user created: test@anopongulam.ph / test123456')
  }

  const user = await client.query('SELECT id FROM "User" WHERE username = $1', ["testcook"])
  const userId = user.rows[0].id
  await client.query('UPDATE "Recipe" SET "authorId" = $1 WHERE "authorId" IS NULL', [userId])
  console.log("Recipes linked to user:", userId)

  await client.end()
}

createTestUser().catch((e) => console.log("Error:", e.message))
