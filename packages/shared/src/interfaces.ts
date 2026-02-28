// ============================================
// 全局接口定义 — DI 容器核心
// ============================================

/**
 * 配置服务接口 — 所有 Service 必须注入
 * 从 system.SystemConfig 读取配置
 * 优先级: 租户级覆盖 > 全局配置 > 代码 fallback
 */
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
  /** 设置配置 */
  set(group: string, key: string, value: string, tenantId?: string, label?: string): Promise<void>
  /** 清除缓存 */
  invalidateCache(group?: string, tenantId?: string): Promise<void>
}

/**
 * 基础 Repository 接口
 */
export interface IBaseRepository<T, CreateDTO = unknown, UpdateDTO = unknown> {
  findById(id: string): Promise<T | null>
  create(data: CreateDTO): Promise<T>
  update(id: string, data: UpdateDTO): Promise<T>
  delete(id: string): Promise<void>
}
