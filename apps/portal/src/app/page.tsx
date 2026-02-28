import { redirect } from 'next/navigation'

/**
 * 根路由 — 重定向到 Dashboard
 */
export default function HomePage() {
  redirect('/dashboard')
}
