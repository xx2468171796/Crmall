# Spec: 全局设计系统

## Status: implemented

## 概述
统一的设计令牌 (Design Tokens) + Shadcn UI Zinc 主题，确保全项目视觉一致性。

## 设计令牌 (packages/ui)
- **品牌色**: Zinc 色系 (50-950)
- **功能色**: success(绿) / warning(黄) / error(红) / info(蓝)
- **模块色**: 每个业务模块有专属强调色
  - CRM: 蓝 / Ordering: 紫 / Inventory: 琥珀 / Finance: 绿
  - OKR: 橙 / Docs: 靛蓝 / LMS: 粉 / Platform: 青
- **间距**: 基于 4px 网格
- **圆角**: 0.5rem 默认
- **阴影**: card / dropdown / modal 三级
- **Z-Index**: dropdown(50) → sticky(100) → overlay(200) → modal(300) → toast(500)

## 布局常量
- 侧边栏: 展开 280px / 收起 68px
- 顶部导航: 56px
- 内容区: 最大 1440px，内边距 24px
- 移动端断点: 768px

## CSS 变量
- Light/Dark 双主题，通过 CSS 变量切换
- 使用 oklch 色彩空间
- 侧边栏独立变量 (--sidebar-*)

## 组件规范
- 全部使用 Shadcn UI 组件
- `cn()` 函数合并类名 (clsx + tailwind-merge)
- 禁止引入其他 UI 库
