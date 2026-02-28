// ============================================
// 业务异常类体系 (OOP)
// ============================================

/**
 * 错误码常量
 */
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE: 'DUPLICATE',
  BUSINESS_RULE: 'BUSINESS_RULE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
} as const

/**
 * 应用基础异常
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '未登入，请先登录') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '无权限执行此操作') {
    super('FORBIDDEN', message, 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const msg = id ? `${resource} (${id}) 不存在` : `${resource} 不存在`
    super('NOT_FOUND', msg, 404)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 422, details)
    this.name = 'ValidationError'
  }
}

export class InsufficientBalanceError extends AppError {
  constructor(currentBalance?: number, requiredAmount?: number) {
    super('INSUFFICIENT_BALANCE', '余额不足，请联系总部充值', 400, { currentBalance, requiredAmount })
    this.name = 'InsufficientBalanceError'
  }
}

export class InsufficientStockError extends AppError {
  constructor(productName: string, available: number, required: number) {
    super('INSUFFICIENT_STOCK', `${productName} 库存不足 (可用: ${available}, 需要: ${required})`, 400, { productName, available, required })
    this.name = 'InsufficientStockError'
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string, field: string) {
    super('DUPLICATE', `${resource} 的 ${field} 已存在`, 409)
    this.name = 'DuplicateError'
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super('BUSINESS_RULE', message, 400)
    this.name = 'BusinessRuleError'
  }
}
