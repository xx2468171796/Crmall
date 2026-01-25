import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma, type DataScope } from "@nexus/db"

declare module "next-auth" {
  interface User {
    tenantId?: string | null
    companyId?: string | null
    departmentId?: string | null
    teamId?: string | null
    dataScope?: DataScope
    isPlatformAdmin?: boolean
  }

  interface Session {
    user: User & {
      id: string
      tenantId?: string | null
      companyId?: string | null
      departmentId?: string | null
      teamId?: string | null
      dataScope: DataScope
      isPlatformAdmin: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tenantId?: string | null
    companyId?: string | null
    departmentId?: string | null
    teamId?: string | null
    dataScope?: DataScope
    isPlatformAdmin?: boolean
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            employee: {
              include: {
                team: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

        const employee = user.employee
        let dataScope: DataScope = "SELF"

        if (user.isPlatformAdmin) {
          dataScope = "PLATFORM"
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tenantId: user.tenantId,
          companyId: employee?.companyId,
          departmentId: employee?.team?.departmentId,
          teamId: employee?.teamId,
          dataScope,
          isPlatformAdmin: user.isPlatformAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId
        token.companyId = user.companyId
        token.departmentId = user.departmentId
        token.teamId = user.teamId
        token.dataScope = user.dataScope
        token.isPlatformAdmin = user.isPlatformAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.tenantId = token.tenantId
        session.user.companyId = token.companyId
        session.user.departmentId = token.departmentId
        session.user.teamId = token.teamId
        session.user.dataScope = token.dataScope || "SELF"
        session.user.isPlatformAdmin = token.isPlatformAdmin || false
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
}
