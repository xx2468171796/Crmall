import { randomUUID } from 'crypto'
import { PAGINATION } from './constants'

/**
 * 生成防碰撞的业务单据号
 * 格式: PREFIX-YYYYMMDD-XXXXXXXX (8位UUID片段)
 */
export function generateDocumentNo(prefix: string): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const uuid = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `${prefix}-${y}${m}${d}-${uuid}`
}

/**
 * 限制分页参数在合理范围内
 */
export function clampPagination(page?: number, perPage?: number) {
  return {
    page: Math.max(1, page ?? 1),
    perPage: Math.min(PAGINATION.MAX_PER_PAGE, Math.max(1, perPage ?? PAGINATION.DEFAULT_PER_PAGE)),
  }
}
