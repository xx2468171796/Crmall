# WebSocket 技能 — 实时系统

## 技术栈
- Socket.IO (Server + Client)
- Redis Pub/Sub (多实例广播)
- Auth.js Session Token 认证

## 事件类型定义

所有事件必须在 `src/lib/ws/events.ts` 中定义类型：

```typescript
export interface ServerToClientEvents {
  'order:new': (data: { orderId: string; tenantId: string; amount: number }) => void
  'order:status_changed': (data: { orderId: string; status: string }) => void
  'order:shipped': (data: { orderId: string; trackingNo: string }) => void
  'stock:low': (data: { productId: string; warehouseId: string; quantity: number }) => void
  'workorder:assigned': (data: { workOrderId: string; assigneeId: string }) => void
  'notification:new': (data: { title: string; body: string; link?: string }) => void
}

export interface ClientToServerEvents {
  'chat:message': (data: { to: string; content: string }) => void
  'presence:online': () => void
}
```

## 房间设计

| 房间 | 加入条件 | 用途 |
|------|----------|------|
| platform | platform_admin | 总部接收所有事件 |
| tenant:{tenantId} | 该租户用户 | 子公司内部事件 |
| user:{userId} | 个人 | 个人通知 |

## 客户端 Hook

```typescript
// 基础连接
export function useSocket() {
  const socket = useRef<Socket>(null)
  useEffect(() => {
    socket.current = io(WS_URL, {
      auth: { token: getSessionToken() },
      transports: ['websocket'],
    })
    return () => { socket.current?.disconnect() }
  }, [])
  return socket.current
}

// 模块专用
export function useOrderSocket(onNewOrder?: (data: any) => void) {
  const socket = useSocket()
  useEffect(() => {
    if (!socket || !onNewOrder) return
    socket.on('order:new', onNewOrder)
    return () => { socket.off('order:new') }
  }, [socket, onNewOrder])
}
```

## 服务端触发

在 Service 类中触发事件：

```typescript
class OrderService {
  constructor(private readonly wsService: IWebSocketService) {}

  async createOrder(dto: CreateOrderDTO) {
    const order = await this.orderRepo.create(dto)
    // 通知总部
    this.wsService.emitToPlatform('order:new', {
      orderId: order.id,
      tenantId: dto.tenantId,
      amount: order.totalAmount
    })
    return order
  }
}
```
