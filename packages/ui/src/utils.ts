// ============================================
// 工具函数 — cn (className 合并)
// ============================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名，自动处理冲突
 * 全项目统一使用此函数，禁止直接拼接字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
