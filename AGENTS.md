# TWCRM — 台湾智能家居 CRM 系统

## 项目概述
集团总部 + 多子公司（经销商）的智能家居 CRM 系统，包含订货、CRM、进销存、培训、财务、OKR 等模块。

## 技术栈
- **框架**: Next.js 16 (App Router + Turbopack)
- **语言**: TypeScript 5.7+ 严格模式
- **包管理**: pnpm 10.x (workspace，严禁 yarn/npm/bun)
- **ORM**: Prisma 7 (PostgreSQL 17, Multi-Schema)
- **认证**: Auth.js v5 (自建，不用 Clerk)
- **权限**: 自建 RBAC (行级多租户隔离)
- **CSS**: Tailwind CSS 4.2 + Shadcn UI (Zinc 主题)
- **状态**: Zustand 5 (UI) + Nuqs (URL)
- **实时**: Socket.IO + Redis Pub/Sub
- **编辑器**: BlockNote (Notion 风格)
- **表格系统**: Teable (源码集成)
- **i18n**: next-intl (zh-CN 默认 / zh-TW / en)
- **图表**: Recharts 3
- **表格**: TanStack Table 8
- **表单**: React Hook Form 7 + Zod 4

## 架构原则
1. **OOP 分层**: Component → Hook → Action → Service → Repository → Entity
2. **DI 容器**: Service 通过工厂函数创建（`src/lib/container.ts`），注入 ConfigService + Repository
3. **可配置化**: 所有业务参数从 `system.SystemConfig` 读取，禁止硬编码，通过 ConfigService 访问
4. **配置优先级**: 租户级覆盖 > 全局配置 > 代码 fallback
5. **接口优先**: Service/Repository 必须先定义 Interface (IXxxService/IXxxRepository)
6. **多租户**: 行级隔离 (tenantId)，总部看全部，子公司互不可见
7. **模块化**: Feature-based 目录结构，每模块独立 Service/Repository/Hook
8. **实时**: WebSocket 事件驱动，订单/库存/工单状态实时推送
9. **国际化**: 用户级语言偏好，所有文案走 i18n，默认简体中文

## 业务模块
1. **订货系统** (ordering) — 子公司 B2B 订货，余额支付，物流追踪
2. **CRM** (crm) — 客户/商机/合同/工单
3. **进销存** (inventory) — 多仓库/SN码/采购/调拨
4. **培训 LMS** (lms) — 课程/考试/证书
5. **财务** (finance) — 收款/付款/发票/报表
6. **OKR** (okr) — OKR/KPI/项目管理/TodoList
7. **文档** (docs) — BlockNote 知识库，跨模块引用

## 编码规范
- 详见 `doc/编码规范.md`
- Cursor Rules: `.cursor/rules/`
- Skills: `skills/`

## 技能挂载 (Skills)

开发时必须根据任务类型加载对应技能：

| 技能 | 路径 | 触发场景 |
|------|------|----------|
| **config-service** | `skills/config-service/SKILL.md` | 读取/写入系统配置，可配置化参数，ConfigService 使用 |
| **oop-template** | `skills/oop-template/SKILL.md` | 创建新模块/新实体，OOP 脚手架，DI 工厂注册 |
| **auth** | `skills/auth/SKILL.md` | 登录/注册/Session/OAuth/密码重置 |
| **rbac** | `skills/rbac/SKILL.md` | 权限检查/菜单授权/路由守卫/多租户隔离 |
| **db-browser** | `skills/db-browser/SKILL.md` | 查看表结构/查询数据/执行SQL/Redis/MinIO（Windows本地） |
| **db-operations** | `skills/db-operations/SKILL.md` | CRUD/迁移/事务/Multi-Schema/Repository |
| **ui-components** | `skills/ui-components/SKILL.md` | 页面/组件/表单/表格/弹窗 |
| **websocket** | `skills/websocket/SKILL.md` | 实时推送/事件定义/房间管理 |
| **i18n** | `skills/i18n/SKILL.md` | 多语言/语言切换/翻译文件 |
| **build-standards** | `skills/build-standards/SKILL.md` | 构建/部署/环境变量 |
| **testing** | `skills/testing/SKILL.md` | 单元测试/集成测试/E2E |
| **feature-evaluation** | `skills/feature-evaluation/SKILL.md` | 新功能开发前评估 |
| **ui-ux-pro-max** | `skills/ui-ux-pro-max/SKILL.md` | UI 设计/配色/字体/UX 指南 |

## OpenSpec 工作流

本项目使用 OpenSpec 进行规范驱动开发。所有新功能、架构变更、破坏性改动必须先创建提案。

### 何时创建提案
- 新增功能或模块
- 破坏性变更（API、Schema）
- 架构或模式变更
- 性能优化（改变行为）
- 安全模式变更

### 何时跳过提案
- Bug 修复（恢复预期行为）
- 拼写/格式/注释修改
- 非破坏性依赖更新
- 配置变更
- 为已有行为补充测试

### 工作流程

```
1. 创建提案 (Stage 1)
   openspec list                    # 查看当前状态
   openspec list --specs            # 查看已有规范
   → 创建 proposal.md + tasks.md + spec deltas
   → openspec validate <id> --strict
   → 等待审批

2. 实施开发 (Stage 2)
   → 读取 proposal.md / design.md / tasks.md
   → 按 tasks.md 顺序逐项实施
   → 完成后更新 checklist

3. 归档 (Stage 3)
   → openspec archive <change-id> --yes
   → 更新 specs/
   → openspec validate --strict
```

### 目录结构
```
openspec/
├── project.md              # 项目约定（已适配 TWCRM 新架构）
├── config.yaml             # 配置（含 artifact 规则）
├── specs/                  # 当前真相 — 已构建的能力规范
│   ├── auth-rbac/          # 认证与权限
│   ├── database/           # 数据库 Multi-Schema 设计
│   ├── design-system/      # 全局设计系统
│   ├── i18n/               # 国际化
│   ├── monorepo/           # Monorepo 基础设施
│   ├── notification/       # 公告与通知
│   ├── ordering/           # B2B 订货系统
│   ├── crm/                # CRM 核心
│   └── websocket/          # WebSocket 实时系统
├── changes/                # 提案 — 待变更的
│   └── archive/            # 已归档的旧提案
```

详细说明见 `openspec/AGENTS.md`。

## 基础设施
- PostgreSQL: 192.168.110.246:5433 (DB: crmall0125)
- Redis: 192.168.110.246:6379
- MinIO: 192.168.110.246:9000
- 详见 `doc/连接信息.md`
