require("dotenv").config()
const { Client } = require("pg")
const bcrypt = require("bcryptjs")

async function checkPassword() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const email = "junalvior21@gmail.com"
  const passwordInput = "09172785738jun"
  
  const result = await client.query('SELECT "passwordHash" FROM "User" WHERE email = $1', [email])
  
  if (result.rows.length > 0) {
    const hash = result.rows[0].passwordHash
    const isMatch = await bcrypt.compare(passwordInput, hash)
    console.log("PASSWORD_MATCH_RESULT:", isMatch)
  } else {
    console.log("USER_NOT_FOUND")
  }

  await client.end()
}

checkPassword().catch((e) => console.log("Error checking password:", e.message))
