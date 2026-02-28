# Spec: WebSocket 实时系统

## Status: designed

## 概述
Socket.IO + Redis Pub/Sub 实现多实例广播，Auth.js Session Token 认证。

## 事件列表
| 事件 | 方向 | 说明 |
|------|------|------|
| `order:new` | S→C | 新订单通知（总部） |
| `order:status_changed` | S→C | 订单状态变更 |
| `order:shipped` | S→C | 发货通知 |
| `stock:low` | S→C | 库存预警 |
| `stock:updated` | S→C | 库存变更 |
| `workorder:assigned` | S→C | 工单指派 |
| `workorder:completed` | S→C | 工单完成 |
| `notification:new` | S→C | 系统通知 |
| `announcement:new` | S→C | 新公告 |
| `chat:message` | 双向 | 即时消息 |

## 房间设计
| 房间 | 加入条件 | 用途 |
|------|----------|------|
| `platform` | platform_admin | 总部接收所有事件 |
| `tenant:{tenantId}` | 该租户用户 | 子公司内部事件 |
| `user:{userId}` | 个人 | 个人通知 |

## 类型定义
- `ServerToClientEvents` — 服务端推送事件类型
- `ClientToServerEvents` — 客户端发送事件类型
- 定义在 `@twcrm/shared` 包中
