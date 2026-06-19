/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg")
const fs = require("fs")

const sql = fs.readFileSync("prisma/migration.sql", "utf8")
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

async function run() {
  const client = new Client({
    connectionString:
      "postgresql://postgres.ywcuulcgkwblaqxjlujf:09172785738jun@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
    statement_timeout: 60000,
    query_timeout: 60000,
  })

  await client.connect()
  console.log("Connected")

  for (let i = 0; i < statements.length; i++) {
    try {
      await client.query(statements[i])
      console.log("OK:", statements[i].substring(0, 80))
    } catch (e) {
      const msg = (e.message || "").substring(0, 80)
      const code = e.code || ""
      if (code === "42710" || code === "42P07") {
        console.log("Exists:", statements[i].substring(0, 60))
      } else {
        console.log(`FAIL [${code}] at ${i}: ${msg}`)
      }
    }
  }

  console.log("Migration done")
  await client.end()
}

run().catch((e) => console.log("Fatal:", (e.message || "").substring(0, 100)))
