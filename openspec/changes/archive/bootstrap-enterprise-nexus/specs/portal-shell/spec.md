# Spec: Portal App Shell

## Capability
`portal-shell` - Portal 主控台骨架

## ADDED Requirements

### Requirement: App Shell 布局
**Priority**: P0
**Rationale**: 所有页面的统一容器

#### Scenario: 渲染基础布局
**Given** 用户访问 `/dashboard`
**When** 页面加载完成
**Then**
- Header 显示 Logo 和用户头像
- Sidebar 显示导航菜单
- Main 区域显示 Dashboard 内容
- Breadcrumbs 显示 "首页 / Dashboard"

#### Scenario: Sidebar 折叠
**Given** 用户在桌面端
**When** 点击 Sidebar 折叠按钮
**Then**
- Sidebar 宽度从 256px 变为 64px
- 菜单项只显示图标
- Main 区域宽度自适应

#### Scenario: 移动端抽屉
**Given** 用户在移动端 (< 768px)
**When** 点击汉堡菜单按钮
**Then**
- Sidebar 以抽屉形式从左侧滑入
- 背景显示遮罩层
- 点击遮罩可关闭

---

### Requirement: 动态菜单
**Priority**: P0
**Rationale**: 菜单由 Directus 控制，支持权限过滤

#### Scenario: 加载菜单数据
**Given** 用户已登录且有部分模块权限
**When** Portal 初始化
**Then**
- 从 Directus 获取菜单配置
- 根据用户权限过滤不可见菜单项
- 缓存到 TanStack Query

#### Scenario: 菜单结构
**Given** Directus 返回以下菜单数据
```json
[
  { "id": "1", "label": "Dashboard", "icon": "home", "path": "/dashboard" },
  { "id": "2", "label": "CRM", "icon": "users", "path": "/crm", "permission": "crm:read" },
  { "id": "3", "label": "OKR", "icon": "target", "path": "/okr", "permission": "okr:read" }
]
```
**When** 用户只有 `crm:read` 权限
**Then**
- 显示 Dashboard 和 CRM
- 不显示 OKR

---

### Requirement: Breadcrumbs 导航
**Priority**: P1
**Rationale**: 用户定位和快速返回

#### Scenario: 自动生成面包屑
**Given** 用户访问 `/crm/customers/123`
**When** 页面加载
**Then**
- Breadcrumbs 显示: 首页 > CRM > 客户 > 客户详情
- 每级可点击跳转

---

### Requirement: 响应式设计
**Priority**: P0
**Rationale**: 支持桌面和移动端

#### Scenario: 断点适配
**Given** 以下断点定义
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
**When** 窗口宽度变化
**Then**
- Mobile: Sidebar 隐藏，显示汉堡按钮
- Tablet: Sidebar 默认折叠
- Desktop: Sidebar 默认展开

---

## Component Structure

```
apps/portal/src/
├── app/
│   ├── layout.tsx           # Root layout (HTML, Providers)
│   ├── (auth)/              # 认证相关页面 (无 Shell)
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/         # 受保护页面 (有 Shell)
│       ├── layout.tsx       # App Shell layout
│       ├── page.tsx         # Dashboard home
│       ├── crm/
│       └── okr/
├── components/
│   ├── layouts/
│   │   ├── app-shell.tsx    # Server Component wrapper
│   │   ├── header.tsx       # Server Component
│   │   ├── sidebar.tsx      # Client Component
│   │   └── breadcrumbs.tsx  # Server Component
│   └── features/
│       ├── user-nav.tsx     # 用户菜单下拉
│       └── theme-toggle.tsx # 主题切换
└── store/
    └── sidebar.ts           # Zustand store
```

---

## Sidebar Store

```typescript
// apps/portal/src/store/sidebar.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarState {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggle: () => void
  setMobileOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setMobileOpen: (open) => set({ isMobileOpen: open }),
    }),
    { name: "sidebar-state" }
  )
)
```
