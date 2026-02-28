## ADDED Requirements

### Requirement: Design System Generation
UI/UX 开发 SHALL 遵循设计系统工作流，确保风格、配色、字体的一致性。

#### Scenario: 新页面开发
- **WHEN** 需要创建新页面或组件
- **THEN** 首先确定产品类型和风格
- **AND** 选择合适的 UI 风格 (Glassmorphism/Minimalism/Soft UI 等)
- **AND** 确定配色方案和字体搭配

#### Scenario: 设计系统复用
- **WHEN** 项目已有设计系统
- **THEN** 复用现有主题变量
- **AND** 保持风格一致性

### Requirement: Shadcn UI Components
UI 开发 SHALL 优先使用 shadcn/ui 组件，确保一致性和可访问性。

#### Scenario: 组件选择
- **WHEN** 需要 UI 组件
- **THEN** 检查 shadcn/ui 是否有对应组件
- **AND** 优先使用 shadcn/ui 组件
- **AND** 禁止手写原生 HTML 替代

#### Scenario: 组件定制
- **WHEN** 需要定制组件样式
- **THEN** 通过 Tailwind CSS 类名定制
- **AND** 不修改 shadcn/ui 源码
- **AND** 使用主题变量实现主题化

### Requirement: Icon Standards
图标使用 SHALL 统一使用 Lucide React，确保视觉一致性。

#### Scenario: 图标选择
- **WHEN** 需要使用图标
- **THEN** 从 Lucide React 中选择
- **AND** 保持图标尺寸一致 (h-5 w-5 或 h-6 w-6)
- **AND** 禁止使用 Emoji 作为图标

#### Scenario: 图标颜色
- **WHEN** 设置图标颜色
- **THEN** 使用 `currentColor` 继承父元素颜色
- **AND** 或使用主题色 (`text-primary`)

### Requirement: Interaction Patterns
交互元素 SHALL 提供清晰的视觉反馈，确保良好的用户体验。

#### Scenario: 可点击元素
- **WHEN** 元素可点击
- **THEN** 添加 `cursor-pointer`
- **AND** 提供悬停状态 (`hover:bg-muted`)
- **AND** 使用平滑过渡 (`transition-colors duration-200`)

#### Scenario: 焦点状态
- **WHEN** 元素可获得焦点
- **THEN** 提供可见的焦点指示器
- **AND** 使用 `focus-visible:ring-2`

### Requirement: Accessibility Compliance
UI 开发 SHALL 符合 WCAG AA 标准，确保无障碍访问。

#### Scenario: 颜色对比度
- **WHEN** 设置文本颜色
- **THEN** 确保对比度 ≥4.5:1 (正常文本)
- **AND** 确保对比度 ≥3:1 (大文本)

#### Scenario: 表单无障碍
- **WHEN** 创建表单
- **THEN** 所有输入有 label
- **AND** 错误信息可被辅助技术读取
- **AND** 支持键盘导航

#### Scenario: 动画偏好
- **WHEN** 使用动画
- **THEN** 尊重 `prefers-reduced-motion`
- **AND** 提供简化动画或无动画版本
