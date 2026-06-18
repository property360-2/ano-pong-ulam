import crypto from "crypto"

const SECRET = process.env.AUTH_SECRET || "fallback-dev-secret-do-not-use"

export function createResetToken(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60
  const payload = `${userId}:${exp}`
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url")
  return Buffer.from(`${payload}.${sig}`).toString("base64url")
}

export function verifyResetToken(token: string): { userId: string; exp: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString()
    const lastDot = decoded.lastIndexOf(".")
    if (lastDot === -1) return null

    const payload = decoded.slice(0, lastDot)
    const sig = decoded.slice(lastDot + 1)

    const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url")
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null

    const [userId, expStr] = payload.split(":")
    const exp = parseInt(expStr, 10)

    if (Date.now() / 1000 > exp) return null

    return { userId, exp }
  } catch {
    return null
  }
}
