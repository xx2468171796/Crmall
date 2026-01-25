---
name: auth
description: 用户认证与会话管理技能。在需要实现登录、注册、登出、Session 管理、OAuth 集成、密码重置等功能时使用此技能。基于 Auth.js v5 + Redis Session Store + Directus RBAC。
---

# 用户认证技能 (Auth Skill)

实现用户认证相关功能时，遵循以下流程和规范。

## 技术栈

- **Auth.js v5** (NextAuth) - 身份认证框架
- **Redis** - Session 存储
- **Zod** - 输入验证
- **Prisma** - 用户数据存储
- **Server Actions** - 后端逻辑

## 核心流程

### 用户注册

```typescript
// src/actions/auth/register.ts
"use server"

import { registerSchema } from "@/schemas/auth"
import { prisma } from "@/lib/db"
import { hash } from "bcryptjs"

export async function register(formData: FormData) {
  const validated = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  
  if (!validated.success) {
    return { error: validated.error.flatten() }
  }
  
  const hashedPassword = await hash(validated.data.password, 12)
  
  await prisma.user.create({
    data: {
      email: validated.data.email,
      password: hashedPassword,
    },
  })
  
  return { success: true }
}
```

### 用户登录

```typescript
// src/actions/auth/login.ts
"use server"

import { signIn } from "@/lib/auth"
import { loginSchema } from "@/schemas/auth"

export async function login(formData: FormData) {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  
  if (!validated.success) {
    return { error: "Invalid credentials" }
  }
  
  await signIn("credentials", {
    email: validated.data.email,
    password: validated.data.password,
    redirectTo: "/dashboard",
  })
}
```

## Zod Schema 模板

```typescript
// src/schemas/auth.ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少 8 位"),
})

export const registerSchema = loginSchema.extend({
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/[A-Z]/, "需要包含大写字母")
    .regex(/[0-9]/, "需要包含数字"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],
})
```

## 约束规则

1. **严禁使用 API Routes** - 使用 Server Actions
2. **密码必须加密存储** - 使用 bcryptjs hash
3. **Session 存储在 Redis** - 不使用 JWT 本地存储
4. **输入必须 Zod 验证** - 前后端共用 Schema
5. **敏感信息走环境变量** - 禁止硬编码

## 参考文档

- **Auth.js 配置**: 见 `references/authjs-config.md`
- **Redis Session**: 见 `references/redis-session.md`
