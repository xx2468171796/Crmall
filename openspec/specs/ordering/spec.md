# Spec: B2B 子公司订货系统

## Status: designed

## 概述
子公司通过内部电商平台向总部订货，支持余额支付、专属价格、物流追踪。第一期优先实现。

## 业务流程
```
子公司登录 → 浏览产品目录 → 加入购物车 → 提交订单
  → 余额检查 → 扣款 → 订单生成
  → 总部备货 → 填写物流单号 → 发货
  → 子公司查看物流 → 确认收货 → 库存入库
```

## 功能清单
- 产品目录 (总部维护，分类浏览)
- 子公司专属价格 + 多币种/汇率
- MOQ 配置 (可配置最小起订量)
- 定制产品提示
- 购物车
- 余额支付 (在线支付预留)
- 订单管理
- 物流追踪
- 确认收货 → 自动入库
- 余额管理 (总部充值)

## 数据模型 (ordering schema)
- ProductCategory, CatalogProduct, TenantPrice
- ExchangeRate, CartItem
- TenantAccount, AccountTransaction
- Order, OrderItem, Shipment

## 页面路由
### 子公司
- `/ordering` — 产品目录
- `/ordering/cart` — 购物车
- `/ordering/orders` — 我的订单
- `/ordering/orders/[id]` — 订单详情
- `/ordering/account` — 我的余额

### 总部
- `/platform/products` — 产品管理
- `/platform/pricing` — 价格管理
- `/platform/orders` — 订单管理
- `/platform/shipments` — 发货管理
- `/platform/accounts` — 余额管理

## 权限
- `ordering:read:catalog` / `ordering:create:order` / `ordering:read:order`
- `ordering:read:account` / `ordering:create:price` / `ordering:update:shipment`
