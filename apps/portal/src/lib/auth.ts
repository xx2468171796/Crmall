// ============================================
// Auth.js v5 配置
// 使用共享 prisma 实例（禁止单独 new PrismaClient）
// ============================================

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@twcrm/db'
import type { SessionUser } from '@twcrm/shared'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            tenant: true,
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        })

        if (!user || user.status !== 'active') return null

        const isValid = await compare(password, user.passwordHash)
        if (!isValid) return null

        // 更新最后登录时间
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // 构建权限码: module:action:resource
        const roles = user.roles.map((ur) => ur.role.name)
        const permissions = [
          ...new Set(
            user.roles.flatMap((ur) =>
              ur.role.permissions.map(
                (rp) => `${rp.permission.module}:${rp.permission.action}:${rp.permission.resource}`
              )
            )
          ),
        ]
        const isPlatform = user.tenant.parentId === null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          tenantId: user.tenantId,
          tenantCode: user.tenant.code,
          tenantName: user.tenant.name,
          roles,
          permissions,
          locale: user.locale,
          isPlatform,
        }
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as SessionUser & { id: string }
        token.id = u.id
        token.tenantId = u.tenantId
        token.tenantCode = u.tenantCode
        token.tenantName = u.tenantName
        token.roles = u.roles
        token.permissions = u.permissions
        token.locale = u.locale
        token.isPlatform = u.isPlatform
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as unknown as SessionUser
        u.id = token.id as string
        u.tenantId = token.tenantId as string
        u.tenantCode = token.tenantCode as string
        u.tenantName = token.tenantName as string
        u.roles = token.roles as string[]
        u.permissions = token.permissions as string[]
        u.locale = token.locale as SessionUser['locale']
        u.isPlatform = token.isPlatform as boolean
      }
      return session
    },
  },
})
