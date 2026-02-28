## ADDED Requirements

### Requirement: Atomic Design Structure
所有 UI 组件必须遵循原子化设计模式。组件 SHALL 分为三个层级：atoms、molecules、organisms。

#### Scenario: 组件层级划分
- **WHEN** 创建新 UI 组件
- **THEN** 必须放置在正确的目录层级
- **AND** atoms 放 `src/components/ui/`
- **AND** molecules 放 `src/components/shared/`
- **AND** organisms 放 `src/components/features/`

#### Scenario: 组件大小限制
- **WHEN** 单个组件文件超过 150 行
- **THEN** 必须拆分为更小的子组件
- **AND** 保持单一职责原则

### Requirement: Shadcn UI First
系统 SHALL 优先使用 shadcn/ui 组件库。禁止手写原生 HTML 替代已有组件。

#### Scenario: 使用 Button 组件
- **WHEN** 需要按钮交互
- **THEN** 必须使用 `@/components/ui/button`
- **AND** 禁止使用原生 `<button>` 或手写样式

#### Scenario: 使用 Form 组件
- **WHEN** 需要表单交互
- **THEN** 必须使用 React Hook Form + Zod
- **AND** 使用 shadcn/ui Form 组件
- **AND** 禁止使用原生 `<form>` 无验证提交

### Requirement: Tailwind CSS Only
样式 SHALL 使用 Tailwind CSS v4。严禁创建独立 CSS 文件（globals.css 除外）。

#### Scenario: 响应式设计
- **WHEN** 组件需要适配不同屏幕尺寸
- **THEN** 必须使用 Tailwind 响应式前缀 (`sm:`, `md:`, `lg:`)
- **AND** 禁止使用 JavaScript 判断窗口宽度

#### Scenario: 主题变量
- **WHEN** 需要使用颜色或间距
- **THEN** 必须使用 CSS Variables (`--primary`, `--secondary`)
- **AND** 在 `globals.css` 中定义
- **AND** 支持暗色模式切换

### Requirement: Icon System
系统必须使用统一的图标库。图标 SHALL 来自 Lucide React。

#### Scenario: 使用图标
- **WHEN** 需要展示图标
- **THEN** 必须从 `lucide-react` 导入
- **AND** 禁止使用内联 SVG 或其他图标库

### Requirement: Loading States
所有异步操作必须展示加载状态。系统 SHALL 提供统一的 Loading 组件。

#### Scenario: 数据加载中
- **WHEN** 组件正在获取数据
- **THEN** 展示 Skeleton 或 Spinner
- **AND** 禁止空白等待

#### Scenario: 按钮提交中
- **WHEN** 用户点击提交按钮
- **THEN** 按钮进入 loading 状态
- **AND** 禁止重复点击
