---
description: 用户认证与会话管理技能。在需要实现登录、注册、登出、Session 管理、OAuth 集成、密码重置等功能时使用此技能。基于 Auth.js v5 + Redis Session Store + Directus RBAC。
---

# 用户认证技能 (Auth Skill)

阅读 `skills/auth/SKILL.md` 获取完整指南。

## 快速参考

### 技术栈
- **Auth.js v5** - 身份认证
- **Redis** - Session 存储
- **Zod** - 输入验证

### 核心文件
- `src/actions/auth/register.ts` - 注册
- `src/actions/auth/login.ts` - 登录
- `src/schemas/auth.ts` - Zod Schema
- `src/middleware.ts` - Session 中间件

### 约束
- ❌ 禁止 API Routes，使用 Server Actions
- ❌ 禁止硬编码密钥
- ✅ 密码必须 bcryptjs 加密
- ✅ Session 存 Redis
