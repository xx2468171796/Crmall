// ============================================
// ConfigService — 系统配置服务
// 从 system.SystemConfig 读取配置
// 优先级: 租户级覆盖 > 全局配置 > 代码 fallback
// ============================================

import type { PrismaClient } from '@twcrm/db'
import type { IConfigService } from '@twcrm/shared'

export class ConfigService implements IConfigService {
  private cache = new Map<string, { value: string; expiry: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 分钟缓存

  constructor(private readonly prisma: PrismaClient) {}

  async get(group: string, key: string, tenantId?: string): Promise<string | null> {
    const cacheKey = `${tenantId ?? 'global'}:${group}:${key}`
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) return cached.value

    // 先查租户级覆盖，再查全局
    let config = null
    if (tenantId) {
      config = await this.prisma.systemConfig.findUnique({
        where: { tenantId_group_key: { tenantId, group, key } },
      })
    }
    if (!config) {
      config = await this.prisma.systemConfig.findFirst({
        where: { group, key, tenantId: null },
      })
    }

    const value = config?.value ?? null
    if (value !== null) {
      this.cache.set(cacheKey, { value, expiry: Date.now() + this.TTL })
    }
    return value
  }

  async getNumber(group: string, key: string, tenantId?: string, fallback = 0): Promise<number> {
    const raw = await this.get(group, key, tenantId)
    if (raw === null) return fallback
    const num = Number(raw)
    return isNaN(num) ? fallback : num
  }

  async getBoolean(group: string, key: string, tenantId?: string, fallback = false): Promise<boolean> {
    const raw = await this.get(group, key, tenantId)
    if (raw === null) return fallback
    return raw === 'true' || raw === '1'
  }

  async getJson<T>(group: string, key: string, tenantId?: string, fallback?: T): Promise<T> {
    const raw = await this.get(group, key, tenantId)
    if (raw === null) return fallback as T
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback as T
    }
  }

  async getGroup(group: string, tenantId?: string): Promise<Record<string, string>> {
    const where = tenantId
      ? { group, OR: [{ tenantId: null }, { tenantId }] }
      : { group, tenantId: null }

    const configs = await this.prisma.systemConfig.findMany({ where })
    const result: Record<string, string> = {}

    // 先填全局，再用租户级覆盖
    for (const c of configs.filter((c) => c.tenantId === null)) {
      result[c.key] = c.value
    }
    if (tenantId) {
      for (const c of configs.filter((c) => c.tenantId === tenantId)) {
        result[c.key] = c.value
      }
    }
    return result
  }

  async set(
    group: string,
    key: string,
    value: string,
    tenantId?: string,
    label?: string,
  ): Promise<void> {
    const tid = tenantId ?? ''
    await this.prisma.systemConfig.upsert({
      where: { tenantId_group_key: { tenantId: tid, group, key } },
      update: { value },
      create: { tenantId: tid || null, group, key, value, label },
    })
    await this.invalidateCache(group, tenantId)
  }

  async invalidateCache(group?: string, tenantId?: string): Promise<void> {
    if (!group && !tenantId) {
      this.cache.clear()
      return
    }
    const prefix = `${tenantId ?? 'global'}:${group ?? ''}`
    for (const k of this.cache.keys()) {
      if (k.startsWith(prefix)) this.cache.delete(k)
    }
  }
}
