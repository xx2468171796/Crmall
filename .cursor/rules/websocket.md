# WebSocket 实时系统规则

globs: src/lib/ws/**,src/**/events/**,src/hooks/use-socket*

## 技术栈
- Socket.IO (Server + Client)
- Redis Pub/Sub (多实例广播)
- Auth.js Session Token 认证

## 事件命名
- 格式: {module}:{action}
- 示例: order:new, order:shipped, stock:low, workorder:assigned
- 必须在 events.ts 中定义类型 (ServerToClientEvents / ClientToServerEvents)

## 房间设计
- platform — 总部管理员
- tenant:{tenantId} — 子公司全员
- user:{userId} — 个人通知
- workorder:{id} — 工单协作

## 连接规范
- 连接时必须携带 auth token
- 服务端 middleware 校验 session
- 校验通过后自动加入 tenant 房间
- 断线自动重连

## Hook 规范
- useSocket() — 基础连接 Hook
- use{Module}Socket() — 模块专用 Hook
- 收到事件后用 queryClient.invalidateQueries 刷新数据
- 用 toast 提示用户

## 服务端规范
- WebSocketServer 单例模式
- emitToTenant(tenantId, event, data) — 发给子公司
- emitToPlatform(event, data) — 发给总部
- emitToUser(userId, event, data) — 发给个人
- 业务 Service 中调用 wsService.emit 触发事件
