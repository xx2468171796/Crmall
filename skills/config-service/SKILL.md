# ConfigService 配置服务技能

## 概述
当需要读取/写入系统配置时使用此技能。所有业务参数必须通过 ConfigService 读取，禁止硬编码。

## ConfigService 接口

```typescript
// src/lib/services/config.service.interface.ts
export interface IConfigService {
  /** 获取字符串配置，返回 null 表示未配置 */
  get(group: string, key: string, tenantId?: string): Promise<string | null>

  /** 获取数字配置 */
  getNumber(group: string, key: string, tenantId?: string, fallback?: number): Promise<number>

  /** 获取布尔配置 */
  getBoolean(group: string, key: string, tenantId?: string, fallback?: boolean): Promise<boolean>

  /** 获取 JSON 配置（数组、对象等） */
  getJson<T>(group: string, key: string, tenantId?: string, fallback?: T): Promise<T>

  /** 获取整组配置 */
  getGroup(group: string, tenantId?: string): Promise<Record<string, string>>

  /** 设置配置（后台管理用） */
  set(group: string, key: string, value: string, tenantId?: string, label?: string): Promise<void>

  /** 清除缓存 */
  invalidateCache(group?: string, tenantId?: string): Promise<void>
}
```

## ConfigService 实现

```typescript
// src/lib/services/config.service.ts
import type { PrismaClient } from '@twcrm/db'
import type { IConfigService } from './config.service.interface'

export class ConfigService implements IConfigService {
  private cache = new Map<string, { value: string; expiry: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 分钟缓存

  constructor(private readonly prisma: PrismaClient) {}

  async get(group: string, key: string, tenantId?: string): Promise<string | null> {
    // 1. 查缓存
    const cacheKey = `${tenantId ?? 'global'}:${group}:${key}`
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) return cached.value

    // 2. 查数据库 — 先查租户级，再查全局
    let config = null
    if (tenantId) {
      config = await this.prisma.systemConfig.findUnique({
        where: { tenantId_group_key: { tenantId, group, key } },
      })
    }
    if (!config) {
      config = await this.prisma.systemConfig.findFirst({
        where: { tenantId: null, group, key },
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
    try { return JSON.parse(raw) as T } catch { return fallback as T }
  }

  async getGroup(group: string, tenantId?: string): Promise<Record<string, string>> {
    const configs = await this.prisma.systemConfig.findMany({
      where: { group, OR: [{ tenantId: null }, ...(tenantId ? [{ tenantId }] : [])] },
    })
    const result: Record<string, string> = {}
    // 先填全局，再用租户级覆盖
    for (const c of configs.filter(c => c.tenantId === null)) result[c.key] = c.value
    for (const c of configs.filter(c => c.tenantId === tenantId)) result[c.key] = c.value
    return result
  }

  async set(group: string, key: string, value: string, tenantId?: string, label?: string): Promise<void> {
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
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key)
    }
  }
}
```

## 在 Service 中使用

```typescript
export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly configService: IConfigService,
  ) {}

  async createOrder(tenantId: string, dto: CreateOrderDTO) {
    const autoConfirm = await this.configService.getBoolean('ordering', 'auto_confirm_order', tenantId)
    const minAmount = await this.configService.getNumber('ordering', 'min_order_amount', tenantId, 0)
    const carriers = await this.configService.getJson<string[]>('ordering', 'shipping_carriers', tenantId, [])
    // ...
  }
}
```

## 在 Server Action 中使用（通过 DI 工厂）

```typescript
// 不要直接 new ConfigService，通过 container.ts 工厂获取
import { createOrderService } from '@/lib/container'

export async function createOrderAction(input: unknown) {
  const service = createOrderService() // 内部已注入 ConfigService
  // ...
}
```

## 在前端读取配置（通过 Hook）

```typescript
// hooks/use-config.ts
'use client'
import { useQuery } from '@tanstack/react-query'
import { getConfigAction } from '@/features/system/actions/config.action'

export function useConfig(group: string, key: string) {
  return useQuery({
    queryKey: ['config', group, key],
    queryFn: () => getConfigAction(group, key),
    staleTime: 5 * 60 * 1000,
  })
}

export function useConfigGroup(group: string) {
  return useQuery({
    queryKey: ['config', group],
    queryFn: () => getConfigGroupAction(group),
    staleTime: 5 * 60 * 1000,
  })
}
```

## 配置分组和 Key 完整清单

### general
| key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| app_name | string | "TWCRM" | 系统名称 |
| default_locale | string | "zh-CN" | 默认语言 |
| supported_locales | json | ["zh-CN","zh-TW","en"] | 支持语言 |
| date_format | string | "YYYY-MM-DD" | 日期格式 |
| timezone | string | "Asia/Taipei" | 默认时区 |

### theme
| key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| primary_color | string | "zinc" | 主题色 |
| border_radius | string | "0.5rem" | 圆角 |
| logo_url | string | "" | Logo |
| sidebar_style | string | "default" | 侧边栏风格 |

### ordering
| key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| auto_confirm_order | boolean | false | 自动确认 |
| default_currency | string | "TWD" | 默认币种 |
| min_order_amount | number | 0 | 最低金额 |
| allow_credit_order | boolean | false | 信用下单 |
| order_expire_hours | number | 72 | 过期时间 |
| shipping_carriers | json | ["顺丰","黑猫","新竹货运"] | 物流公司 |
| payment_methods | json | ["balance","bank_transfer"] | 支付方式 |

### crm
| key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| opportunity_stages | json | ["lead","qualified","proposal","negotiation","won","lost"] | 商机阶段 |
| customer_levels | json | ["vip","gold","silver","normal"] | 客户等级 |
| customer_sources | json | ["referral","website","exhibition","cold_call"] | 客户来源 |
| workorder_types | json | ["install","repair","maintain","inspect"] | 工单类型 |
| follow_up_types | json | ["call","visit","email","wechat","line"] | 跟进类型 |

### inventory
| key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| low_stock_threshold | number | 10 | 低库存阈值 |
| enable_sn_tracking | boolean | true | SN 追踪 |
| auto_deduct_on_install | boolean | true | 安装扣库存 |

### notification
| key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| email_enabled | boolean | false | 邮件通知 |
| ws_enabled | boolean | true | WebSocket |
| digest_interval | number | 60 | 摘要间隔(分钟) |
