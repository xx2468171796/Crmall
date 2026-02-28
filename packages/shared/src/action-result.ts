// ============================================
// Server Action 统一返回格式
// ============================================

/**
 * Server Action 返回类型
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string; details?: Record<string, unknown> }

/**
 * 成功返回
 */
export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

/**
 * 失败返回
 */
export function fail(error: string, code?: string, details?: Record<string, unknown>): ActionResult<never> {
  return { success: false, error, code, details }
}

/**
 * 分页返回类型
 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  perPage?: number
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 通用列表查询参数
 */
export interface ListParams extends PaginationParams, SortParams {
  search?: string
}
