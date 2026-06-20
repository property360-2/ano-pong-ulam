require("dotenv").config()
const { Client } = require("pg")

async function checkUser() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log("Connected to DB")

  const email = "junalvior21@gmail.com"
  const result = await client.query('SELECT id, email, username, "displayName", "passwordHash", "isOnboarded" FROM "User" WHERE email = $1', [email])
  
  if (result.rows.length > 0) {
    const user = result.rows[0]
    console.log("USER_FOUND:", {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      hasPasswordHash: !!user.passwordHash,
      isOnboarded: user.isOnboarded
    })
  } else {
    console.log("USER_NOT_FOUND")
  }

  await client.end()
}

checkUser().catch((e) => console.log("Error checking user:", e.message))
