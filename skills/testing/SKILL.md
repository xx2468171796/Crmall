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
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts        # 就近测试文件
├── actions/
│   ├── customer/
│   │   ├── create.ts
│   │   └── create.test.ts   # Server Action 测试
tests/
├── e2e/                     # E2E 测试
│   ├── auth.spec.ts
│   └── customer.spec.ts
└── fixtures/                # 测试数据
    └── customers.json
```

## 单元测试

### 配置 Vitest

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

### 工具函数测试

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest"
import { formatCurrency, validateEmail } from "./utils"

describe("formatCurrency", () => {
  it("should format number to CNY", () => {
    expect(formatCurrency(1234.56)).toBe("¥1,234.56")
  })

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("¥0.00")
  })

  it("should handle negative numbers", () => {
    expect(formatCurrency(-100)).toBe("-¥100.00")
  })
})

describe("validateEmail", () => {
  it("should return true for valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true)
  })

  it("should return false for invalid email", () => {
    expect(validateEmail("invalid-email")).toBe(false)
  })
})
```

### Zod Schema 测试

```typescript
// src/schemas/customer.test.ts
import { describe, it, expect } from "vitest"
import { createCustomerSchema } from "./customer"

describe("createCustomerSchema", () => {
  it("should validate correct data", () => {
    const result = createCustomerSchema.safeParse({
      name: "张三",
      email: "zhangsan@example.com",
    })
    expect(result.success).toBe(true)
  })

  it("should reject empty name", () => {
    const result = createCustomerSchema.safeParse({
      name: "",
      email: "test@example.com",
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("客户名称不能为空")
  })

  it("should reject invalid email", () => {
    const result = createCustomerSchema.safeParse({
      name: "张三",
      email: "invalid",
    })
    expect(result.success).toBe(false)
  })
})
```

## Server Action 测试

```typescript
// src/actions/customer/create.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCustomer } from "./create"

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/lib/db/repositories/customer.repository", () => ({
  customerRepository: {
    create: vi.fn(),
  },
}))

import { auth } from "@/lib/auth"
import { customerRepository } from "@/lib/db/repositories/customer.repository"

describe("createCustomer", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create customer with valid data", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", role: "admin" },
    } as any)
    vi.mocked(customerRepository.create).mockResolvedValue({ id: "customer-1" } as any)

    const formData = new FormData()
    formData.set("name", "张三")
    formData.set("email", "zhangsan@example.com")

    const result = await createCustomer(formData)

    expect(result.success).toBe(true)
    expect(customerRepository.create).toHaveBeenCalledWith({
      name: "张三",
      email: "zhangsan@example.com",
      ownerId: "user-1",
    })
  })

  it("should return error for invalid data", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1" },
    } as any)

    const formData = new FormData()
    formData.set("name", "") // Invalid

    const result = await createCustomer(formData)

    expect(result.error).toBeDefined()
  })

  it("should throw for unauthenticated user", async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const formData = new FormData()
    formData.set("name", "张三")

    await expect(createCustomer(formData)).rejects.toThrow("Unauthorized")
  })
})
```

## E2E 测试

### 配置 Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E 测试示例

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login")

    await page.fill('input[name="email"]', "admin@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL("/dashboard")
    await expect(page.locator("text=欢迎回来")).toBeVisible()
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login")

    await page.fill('input[name="email"]', "wrong@example.com")
    await page.fill('input[name="password"]', "wrongpassword")
    await page.click('button[type="submit"]')

    await expect(page.locator("text=邮箱或密码错误")).toBeVisible()
  })

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/login")
    await page.fill('input[name="email"]', "admin@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.click('button[type="submit"]')

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click("text=登出")

    await expect(page).toHaveURL("/login")
  })
})
```

## 运行测试

```bash
# 单元测试
yarn test

# 监听模式
yarn test --watch

# 覆盖率
yarn test --coverage

# E2E 测试
yarn playwright test

# E2E UI 模式
yarn playwright test --ui
```

## 覆盖率要求

| 模块类型 | 最低覆盖率 |
|----------|------------|
| 工具函数 (`lib/`) | 90% |
| Zod Schemas | 90% |
| Server Actions | 70% |
| UI 组件 | 50% |

## 核心规范

1. **测试文件就近放置** - `.test.ts` 与源文件同目录
2. **Mock 外部依赖** - 数据库、Auth、外部 API
3. **测试隔离** - 每个测试独立，不依赖执行顺序
4. **清晰的测试名称** - 使用 `should...when...` 格式
5. **覆盖边界情况** - 空值、异常、极端值
