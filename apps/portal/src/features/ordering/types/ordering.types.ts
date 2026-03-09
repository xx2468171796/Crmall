// ============================================
// B2B 订货模块 — 类型定义
// ============================================

// ---- 产品变体 ----

export interface ProductVariantVO {
  id: string
  sku: string
  name: string | null
  images: string[]
  basePrice: number | null  // null 时用 SPU 的
  stock: number
  moq: number | null        // null 时用 SPU 的
  status: string
  attributes: Record<string, string>  // {"颜色":"白色","版本":"Zigbee"}
  tenantPrice: number | null
}

// ---- 产品目录 ----

export interface CatalogProductVO {
  id: string
  sku: string
  name: string
  description: string | null
  images: string[]
  specs: Record<string, unknown> | null
  brand: string | null
  unit: string
  basePrice: number
  tenantPrice: number | null // 子公司专属价格（SPU 级）
  currency: string
  moq: number
  stock: number
  isCustom: boolean
  customNote: string | null
  status: string
  categoryId: string
  categoryName: string
  variants: ProductVariantVO[]
}

export interface CatalogFilters {
  search?: string
  categoryId?: string
  status?: string
  page?: number
  perPage?: number
}

// ---- 购物车 ----

export interface CartItemVO {
  id: string
  productId: string
  productName: string
  productSku: string
  productImage: string | null
  variantId: string
  variantName: string | null
  variantSku: string
  specs: Record<string, string> | null
  price: number
  quantity: number
  subtotal: number
  moq: number
  stock: number
  remark: string | null
}

export interface AddToCartDTO {
  productId: string
  variantId: string  // 必须指定变体
  quantity: number
  remark?: string
}

export interface UpdateCartDTO {
  quantity: number
  remark?: string
}

// ---- 订单 ----

export interface CreateOrderDTO {
  paymentMethod?: string
  remark?: string
}

export interface OrderVO {
  id: string
  orderNo: string
  tenantId: string
  totalAmount: number
  currency: string
  status: string
  paymentMethod: string
  remark: string | null
  cancelReason: string | null
  createdBy: string
  confirmedAt: string | null
  createdAt: string
  updatedAt: string
  items: OrderItemVO[]
  shipment: ShipmentVO | null
}

export interface OrderItemVO {
  id: string
  productId: string
  variantId: string | null
  sku: string
  name: string
  variantName: string | null
  image: string | null
  specs: Record<string, string> | null
  price: number
  quantity: number
  subtotal: number
  remark: string | null
}

export interface OrderFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
  /** 数据范围过滤: 仅查询指定用户创建的订单 */
  createdBy?: string
  /** 数据范围过滤: 仅查询指定部门的订单 */
  departmentId?: string
}

// ---- 物流 ----

export interface ShipmentVO {
  id: string
  orderId: string
  carrier: string | null
  trackingNo: string | null
  shippedAt: string | null
  deliveredAt: string | null
  receivedAt: string | null
  status: string
  remark: string | null
}

export interface ShipOrderDTO {
  carrier: string
  trackingNo: string
  remark?: string
}

// ---- 账户 ----

export interface TenantAccountVO {
  id: string
  tenantId: string
  balance: number
  creditLimit: number
  currency: string
}
