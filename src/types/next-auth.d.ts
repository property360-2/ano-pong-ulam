import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      avatarUrl?: string | null
      image?: string | null
    }
  }

  interface JWT {
    avatarUrl?: string | null
    username?: string
  }
}