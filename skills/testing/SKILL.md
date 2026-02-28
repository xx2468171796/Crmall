---
name: testing
description: 测试规范技能。在需要编写单元测试、集成测试、E2E 测试、组件测试时使用此技能。基于 Vitest + Playwright + React Testing Library。
---

# 测试技能 (Testing Skill)

编写测试相关代码时，遵循以下规范。

## 技术栈

- **Vitest** - 单元测试 / 集成测试
- **Playwright** - E2E 测试
- **React Testing Library** - 组件测试
- **MSW** - API Mock

## 测试目录结构

```
src/features/{module}/
├── services/
│   ├── order.service.ts
│   └── order.service.test.ts     # Service 测试
├── repositories/
│   ├── order.repository.ts
│   └── order.repository.test.ts  # Repository 测试
├── actions/
│   ├── order.actions.ts
│   └── order.actions.test.ts     # Server Action 测试
├── components/
│   ├── order-list.tsx
│   └── order-list.test.tsx       # 组件测试
tests/
├── e2e/                          # E2E 测试
│   ├── auth.spec.ts
│   ├── ordering.spec.ts
│   └── crm.spec.ts
└── fixtures/                     # 测试数据
    └── orders.json
```

## 配置 Vitest

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
})
```

## Service 测试

```typescript
// src/features/ordering/services/order.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { OrderService } from "./order.service"
import { IOrderRepository } from "../repositories/order.repository"

describe("OrderService", () => {
  let service: OrderService
  let mockRepo: IOrderRepository
  let mockAccountService: IAccountService

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      createWithTransaction: vi.fn(),
    } as any
    mockAccountService = {
      checkBalance: vi.fn(),
      deduct: vi.fn(),
    } as any
    service = new OrderService(mockRepo, mockAccountService)
  })

  it("should create order when balance is sufficient", async () => {
    mockAccountService.checkBalance.mockResolvedValue(true)
    mockRepo.createWithTransaction.mockResolvedValue({ id: "order-1" })

    const result = await service.createOrder(mockDto)
    expect(result.id).toBe("order-1")
    expect(mockAccountService.deduct).toHaveBeenCalled()
  })

  it("should throw when balance is insufficient", async () => {
    mockAccountService.checkBalance.mockRejectedValue(
      new InsufficientBalanceError()
    )
    await expect(service.createOrder(mockDto)).rejects.toThrow("餘額不足")
  })
})
```

## 组件测试

```typescript
// src/features/ordering/components/order-list.test.tsx
import { render, screen } from "@testing-library/react"
import { OrderList } from "./order-list"

vi.mock("../hooks/use-order-list", () => ({
  useOrderList: () => ({
    data: { items: [{ id: "1", orderNo: "ORD-001" }] },
    isLoading: false,
  }),
}))

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

describe("OrderList", () => {
  it("should render order list", () => {
    render(<OrderList />)
    expect(screen.getByText("ORD-001")).toBeInTheDocument()
  })
})
```

## E2E 测试

```typescript
// tests/e2e/ordering.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Ordering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.fill('[name="email"]', "test@example.com")
    await page.fill('[name="password"]', "password")
    await page.click('button[type="submit"]')
    await page.waitForURL("/dashboard")
  })

  test("should create order", async ({ page }) => {
    await page.goto("/ordering")
    await page.click('[data-testid="add-to-cart"]')
    await page.goto("/ordering/cart")
    await page.click('[data-testid="submit-order"]')
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible()
  })
})
```

## 运行命令

```bash
# 单元测试
pnpm test

# 监听模式
pnpm test --watch

# 覆盖率
pnpm test --coverage

# E2E 测试
pnpm exec playwright test

# E2E UI 模式
pnpm exec playwright test --ui
```

## 覆盖率要求

| 模块类型 | 最低覆盖率 |
|----------|------------|
| Service 类 | 80% |
| Repository 类 | 70% |
| 工具函数 (`lib/`) | 90% |
| Zod Schemas | 90% |
| Server Actions | 70% |
| UI 组件 | 50% |

## 核心规范

1. **测试文件就近放置** - `.test.ts` 与源文件同目录
2. **Mock 外部依赖** - Prisma、Auth、WebSocket、MinIO
3. **测试隔离** - 每个测试独立，不依赖执行顺序
4. **清晰的测试名称** - 使用 `should...when...` 格式
5. **覆盖边界情况** - 空值、异常、权限不足、余额不足
6. **多租户测试** - 确保 tenantId 隔离正确
