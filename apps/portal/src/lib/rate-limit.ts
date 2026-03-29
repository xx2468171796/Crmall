import { AppError } from '@twcrm/shared'

const attempts = new Map<string, number[]>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, times] of attempts) {
    const fresh = times.filter(t => now - t < 300_000)
    if (fresh.length === 0) attempts.delete(key)
    else attempts.set(key, fresh)
  }
}, 300_000)

/**
 * 滑动窗口限流器
 * @param key 限流键（如 login:email）
 * @param windowMs 窗口大小（毫秒）
 * @param maxAttempts 窗口内最大尝试次数
 */
export function checkRateLimit(key: string, windowMs = 60_000, maxAttempts = 5): void {
  const now = Date.now()
  const entries = (attempts.get(key) ?? []).filter(t => now - t < windowMs)
  if (entries.length >= maxAttempts) {
    throw new AppError('RATE_LIMITED', 'Too many attempts, please try again later', 429)
  }
  entries.push(now)
  attempts.set(key, entries)
}
