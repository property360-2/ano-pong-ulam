import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter, AdapterUser } from "next-auth/adapters"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

const prismaAdapter = PrismaAdapter(prisma)

/**
 * Custom NextAuth Adapter mapping database schema properties (like displayName and avatarUrl)
 * to NextAuth adapter specifications without losing custom fields (like username).
 */
const adapter: Adapter = {
  ...prismaAdapter,
  /**
   * Creates a new user in the database, mapping the incoming adapter user details.
   * 
   * @param data NextAuth adapter user data configuration.
   * @returns A promise resolving to the created AdapterUser.
   */
  createUser: (data) => {
    const input = data as { email: string; name?: string; image?: string; username?: string }
    return prisma.user.create({
      data: {
        email: input.email,
        displayName: input.name ?? undefined,
        avatarUrl: input.image ?? undefined,
        username: input.username ?? `user_${Math.random().toString(36).substring(2, 7)}`,
      },
    }) as unknown as Promise<AdapterUser>
  },
  /**
   * Updates an existing user's details in the database.
   * 
   * @param data NextAuth adapter user data configuration containing the user ID and updating fields.
   * @returns A promise resolving to the updated AdapterUser.
   */
  updateUser: (data) => {
    const input = data as { id: string; email?: string; name?: string; image?: string }
    return prisma.user.update({
      where: { id: input.id },
      data: {
        email: input.email,
        displayName: input.name ?? undefined,
        avatarUrl: input.image ?? undefined,
      },
    }) as unknown as Promise<AdapterUser>
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.username }
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            profile(profile) {
              const emailPrefix = profile.email ? profile.email.split("@")[0] : "user"
              const randomSuffix = Math.random().toString(36).substring(2, 7)
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                username: `${emailPrefix}_${randomSuffix}`,
              }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { avatarUrl: true, username: true },
      })
      if (dbUser) {
        token.avatarUrl = dbUser.avatarUrl
        token.username = dbUser.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.avatarUrl = token.avatarUrl as string | undefined
        session.user.name = token.username as string
      }
      return session
    },
  },
})
