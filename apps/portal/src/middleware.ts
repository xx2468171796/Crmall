// ============================================
// Next.js Middleware — 认证路由保护
// 使用 getToken (JWT) 避免引入 Prisma/pg
// ============================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicPaths = ['/login', '/api/auth']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.AUTH_SECRET })

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
