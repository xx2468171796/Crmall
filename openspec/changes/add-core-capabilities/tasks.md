## 1. 基础设施准备
- [ ] 1.1 确认 PostgreSQL 连接配置 (192.168.110.246:5433)
- [ ] 1.2 确认 Redis 连接配置 (192.168.110.246:6379)
- [ ] 1.3 确认 MinIO 连接配置 (192.168.110.246:9000)
- [ ] 1.4 创建 `.env` 模板文件

## 2. Auth 模块实现
- [ ] 2.1 配置 Auth.js v5 (NextAuth)
- [ ] 2.2 创建用户注册 Server Action (`src/actions/auth/register.ts`)
- [ ] 2.3 创建用户登录 Server Action (`src/actions/auth/login.ts`)
- [ ] 2.4 创建登录/注册 Zod Schema (`src/schemas/auth.ts`)
- [ ] 2.5 创建 Session 中间件 (`src/middleware.ts`)
- [ ] 2.6 集成 Redis Session Store

## 3. UI 组件库搭建
- [ ] 3.1 初始化 shadcn/ui 配置
- [ ] 3.2 创建 atoms 目录结构 (`src/components/ui/`)
- [ ] 3.3 创建 molecules 目录结构 (`src/components/shared/`)
- [ ] 3.4 创建 organisms 目录结构 (`src/components/features/`)
- [ ] 3.5 定义 Tailwind v4 主题变量 (`globals.css`)

## 4. RBAC 权限系统
- [ ] 4.1 设计 Directus 权限 Schema
- [ ] 4.2 创建角色定义 (Admin/Manager/User)
- [ ] 4.3 创建权限检查 Hook (`src/hooks/usePermission.ts`)
- [ ] 4.4 创建路由守卫中间件
- [ ] 4.5 创建菜单动态渲染逻辑

## 5. 功能评估流程
- [ ] 5.1 创建 OpenSpec 提案模板
- [ ] 5.2 定义功能评估检查清单
- [ ] 5.3 创建 `/openspec-proposal` workflow
- [ ] 5.4 创建 `/openspec-apply` workflow

## 6. 数据库操作规范
- [ ] 6.1 初始化 Prisma 配置 (Multi-Schema)
- [ ] 6.2 创建 Repository 基类 (`src/lib/db/repository.ts`)
- [ ] 6.3 定义数据库操作 Zod Schemas
- [ ] 6.4 创建数据库迁移脚本模板
- [ ] 6.5 配置 Prisma Studio 访问

## 7. 打包构建规范
- [ ] 7.1 配置 Turbopack 开发模式
- [ ] 7.2 配置 Next.js Standalone 构建
- [ ] 7.3 创建 Docker 构建配置
- [ ] 7.4 配置 Tauri v2 桌面端构建
- [ ] 7.5 创建 CI/CD 构建脚本

## 8. 测试规范
- [ ] 8.1 配置 Vitest 测试框架
- [ ] 8.2 创建单元测试模板
- [ ] 8.3 创建 Server Actions 测试模板
- [ ] 8.4 配置测试覆盖率报告
- [ ] 8.5 创建 E2E 测试配置 (Playwright)

## 9. 验收与文档
- [ ] 9.1 运行 `openspec validate add-core-capabilities --strict`
- [ ] 9.2 更新 README.md
- [ ] 9.3 创建开发者指南文档
