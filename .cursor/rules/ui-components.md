# UI 组件规则

globs: src/components/**,src/features/**/components/**

## 技术栈
- Shadcn UI (Zinc 主题)
- Tailwind CSS 4.2 (CSS-first 配置)
- Lucide React 图标
- tw-animate-css 动画

## 组件规范
- 单个组件不超过 150 行
- 组件只负责展示，业务逻辑抽到 Hook/Service
- 必须支持 Light/Dark 主题
- 所有文案使用 useTranslations() (next-intl)
- 使用 Shadcn UI 组件，不自己造轮子

## 表格组件
- 使用 TanStack Table 8
- 服务端分页/搜索/过滤
- URL 状态用 Nuqs 管理
- 支持列排序、多选、批量操作

## 表单组件
- React Hook Form 7 + Zod 4
- 使用 Shadcn Form 组件
- 校验错误信息走 i18n
- 提交用 Server Action

## 布局
- Sidebar (可折叠) + Header + Main
- 响应式设计 (mobile-first)
- Command+K 全局搜索 (cmdk)

## 无障碍
- 所有交互元素必须有 aria-label
- 键盘导航支持
- 颜色对比度符合 WCAG AA
