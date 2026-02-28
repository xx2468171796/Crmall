# 可配置化规则

globs: src/**

## 核心原则

所有业务参数必须从数据库 `system.SystemConfig` 表读取，通过 `ConfigService` 类访问。
代码中只保留 fallback 默认值，实际运行值由后台配置决定。

## 配置优先级

```
租户级覆盖 (tenantId 有值)  →  最高优先
全局配置 (tenantId = null)  →  次优先
代码 fallback 默认值        →  最低优先（兜底）
```

子公司可以有自己的配置覆盖全局默认。总部设置全局默认值。

## ConfigService 接口

```typescript
export interface IConfigService {
  /** 获取字符串配置 */
  get(group: string, key: string, tenantId?: string): Promise<string | null>
  /** 获取数字配置 */
  getNumber(group: string, key: string, tenantId?: string, fallback?: number): Promise<number>
  /** 获取布尔配置 */
  getBoolean(group: string, key: string, tenantId?: string, fallback?: boolean): Promise<boolean>
  /** 获取 JSON 配置 */
  getJson<T>(group: string, key: string, tenantId?: string, fallback?: T): Promise<T>
  /** 获取整组配置 */
  getGroup(group: string, tenantId?: string): Promise<Record<string, string>>
  /** 清除缓存 */
  invalidateCache(group?: string, tenantId?: string): Promise<void>
}
```

## 使用方式

```typescript
// Service 中注入 ConfigService
export class OrderService implements IOrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly configService: IConfigService,
  ) {}

  async createOrder(tenantId: string, dto: CreateOrderDTO) {
    const autoConfirm = await this.configService.getBoolean('ordering', 'auto_confirm_order', tenantId)
    const minAmount = await this.configService.getNumber('ordering', 'min_order_amount', tenantId, 0)
    const allowCredit = await this.configService.getBoolean('ordering', 'allow_credit_order', tenantId, false)
    // ...使用配置值
  }
}
```

## 必须可配置的参数清单

### ordering（订货系统）
| group | key | 类型 | 默认值 | 说明 |
|-------|-----|------|--------|------|
| ordering | auto_confirm_order | boolean | false | 订单自动确认 |
| ordering | default_currency | string | "TWD" | 默认币种 |
| ordering | min_order_amount | number | 0 | 最低订单金额 |
| ordering | allow_credit_order | boolean | false | 允许信用下单（余额不足） |
| ordering | order_expire_hours | number | 72 | 未确认订单自动取消时间(小时) |
| ordering | shipping_carriers | json | ["顺丰","黑猫","新竹货运"] | 可选物流公司 |
| ordering | payment_methods | json | ["balance","bank_transfer"] | 可用支付方式 |

### crm（客户管理）
| group | key | 类型 | 默认值 | 说明 |
|-------|-----|------|--------|------|
| crm | opportunity_stages | json | ["lead","qualified","proposal","negotiation","won","lost"] | 商机阶段 |
| crm | customer_levels | json | ["vip","gold","silver","normal"] | 客户等级 |
| crm | customer_sources | json | ["referral","website","exhibition","cold_call"] | 客户来源 |
| crm | workorder_types | json | ["install","repair","maintain","inspect"] | 工单类型 |
| crm | follow_up_types | json | ["call","visit","email","wechat","line"] | 跟进类型 |

### inventory（进销存）
| group | key | 类型 | 默认值 | 说明 |
|-------|-----|------|--------|------|
| inventory | low_stock_threshold | number | 10 | 低库存预警阈值 |
| inventory | enable_sn_tracking | boolean | true | 启用 SN 码追踪 |
| inventory | auto_deduct_on_install | boolean | true | 安装完成自动扣库存 |

### notification（通知）
| group | key | 类型 | 默认值 | 说明 |
|-------|-----|------|--------|------|
| notification | email_enabled | boolean | false | 邮件通知开关 |
| notification | ws_enabled | boolean | true | WebSocket 通知开关 |
| notification | digest_interval | number | 60 | 通知摘要间隔(分钟) |

### theme（主题）
| group | key | 类型 | 默认值 | 说明 |
|-------|-----|------|--------|------|
| theme | primary_color | string | "zinc" | 主题色 |
| theme | border_radius | string | "0.5rem" | 圆角大小 |
| theme | logo_url | string | "" | Logo URL |
| theme | sidebar_style | string | "default" | 侧边栏风格 (default/compact) |

### general（通用）
| group | key | 类型 | 默认值 | 说明 |
|-------|-----|------|--------|------|
| general | app_name | string | "TWCRM" | 系统名称 |
| general | default_locale | string | "zh-CN" | 默认语言 |
| general | supported_locales | json | ["zh-CN","zh-TW","en"] | 支持语言 |
| general | date_format | string | "YYYY-MM-DD" | 日期格式 |
| general | timezone | string | "Asia/Taipei" | 默认时区 |

## 新增配置项流程

1. 在 `packages/db/src/seed.ts` 中添加默认值
2. 在 Service 中通过 `this.configService.getXxx()` 读取
3. 在后台 `/platform/settings` 页面中展示和编辑
4. 更新本规则文件的参数清单

## 后台配置管理

- 路由: `/platform/settings`
- 按 group 分 Tab 展示
- 支持 string / number / boolean / JSON 四种编辑器
- 总部可设全局默认，也可为某个子公司单独覆盖
- 修改后调用 `configService.invalidateCache()` 清除缓存

## 禁止事项

- 禁止硬编码 MOQ、价格、阈值、状态列表、物流公司、支付方式
- 禁止硬编码商机阶段、客户等级、客户来源、工单类型
- 禁止硬编码主题色、圆角、Logo
- 禁止直接查 `SystemConfig` 表（必须通过 ConfigService）
- 禁止在前端组件中直接读配置（通过 Hook 封装 Server Action 读取）
