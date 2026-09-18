import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { mockUsers } from "@/utils/mockData"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Reg Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const identifier = (credentials.email as string).trim()
        const password = credentials.password as string

        // 1. Check Prisma Database
        try {
          let user = await prisma.user.findUnique({
            where: { email: identifier.toLowerCase() },
            include: { student: true },
          })

          if (!user) {
            const student = await prisma.student.findUnique({
              where: { regNumber: identifier.toUpperCase() },
              include: { user: true },
            })
            if (student?.user) {
              user = { ...student.user, student }
            }
          }

          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(password, user.passwordHash)
            if (isValid) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.toLowerCase(),
                image: user.avatar || undefined,
              }
            }
          }
        } catch (dbErr) {
          console.error("Database auth check error:", dbErr)
        }

        // 2. Check Mock Users Fallback
        const mockUser =
          mockUsers[identifier.toLowerCase()] ||
          Object.values(mockUsers).find(
            (u) =>
              u.email.toLowerCase() === identifier.toLowerCase() ||
              (identifier.toUpperCase() === "R2421428" && u.role === "student")
          )

        if (mockUser && mockUser.password === password) {
          return {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role.toLowerCase(),
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "uzconnect-secret-key-change-in-production-2026",
})
