import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter } from "next-auth/adapters"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

const prismaAdapter = PrismaAdapter(prisma)

const adapter: Adapter = {
  ...prismaAdapter,
  createUser: (data) => {
    return prisma.user.create({
      data: {
        email: data.email,
        displayName: data.name ?? undefined,
        avatarUrl: (data as any).image ?? undefined,
        username: (data as any).username,
      },
    }) as any
  },
  updateUser: (data) => {
    return prisma.user.update({
      where: { id: data.id as string },
      data: {
        email: data.email,
        displayName: (data as any).name ?? undefined,
        avatarUrl: (data as any).image ?? undefined,
      },
    }) as any
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
