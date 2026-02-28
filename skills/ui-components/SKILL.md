---
name: ui-components
description: UI 组件开发技能。在需要创建页面、组件、表单、表格、弹窗等 UI 元素时使用此技能。基于 shadcn/ui + Tailwind CSS v4 + React 19 + OOP 分层架构。
---

# UI 组件技能 (UI Components Skill)

创建 UI 组件时，遵循 OOP 分层架构和项目规范。

## 技术栈

- **React 19** - UI 框架
- **shadcn/ui** - 组件库 (Zinc 主题)
- **Tailwind CSS v4** - 样式引擎
- **Lucide React** - 图标库
- **React Hook Form 7** + **Zod 4** - 表单处理
- **TanStack Table 8** - 数据表格
- **next-intl** - 国际化
- **dnd-kit** - 拖拽排序

## 组件分层

```
UI 组件（只负责展示）
    ↓ 调用
自定义 Hook（组合逻辑）
    ↓ 调用
Server Action（后端交互）
    ↓ 调用
Service 类（业务逻辑）
    ↓ 调用
Repository 类（数据访问）
```

## 组件目录结构

```
src/features/{module}/components/
├── {name}-list.tsx       # 列表页
├── {name}-form.tsx       # 表单（创建/编辑）
├── {name}-detail.tsx     # 详情页
├── {name}-card.tsx       # 卡片组件
└── {name}-columns.tsx    # 表格列定义
```

## 组件规范

### 基本规则
- 单个组件不超过 150 行
- 组件只负责展示，业务逻辑抽到 Hook/Service
- 必须支持 Light/Dark 主题
- 所有文案使用 `useTranslations()` (next-intl)
- 使用 Shadcn UI 组件，不自己造轮子

### 列表组件示例

```tsx
// src/features/ordering/components/order-list.tsx
"use client"

import { useTranslations } from "next-intl"
import { DataTable } from "@/components/ui/data-table"
import { useOrderList } from "../hooks/use-order-list"
import { orderColumns } from "./order-columns"

export function OrderList() {
  const t = useTranslations("ordering")
  const { data, isLoading } = useOrderList()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <DataTable
        columns={orderColumns}
        data={data?.items ?? []}
        isLoading={isLoading}
      />
    </div>
  )
}
```

### 表单组件示例

```tsx
// src/features/ordering/components/order-form.tsx
"use client"

import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CreateOrderDTO } from "../schemas/order.schema"
import { createOrderAction } from "../actions/order.actions"
import { toast } from "sonner"

export function OrderForm() {
  const t = useTranslations("ordering")
  const form = useForm({
    resolver: zodResolver(CreateOrderDTO),
  })

  async function onSubmit(data: CreateOrderDTO) {
    const result = await createOrderAction(data)
    if (result.success) {
      toast.success(t("orderCreated"))
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("remark")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{t("submit")}</Button>
      </form>
    </Form>
  )
}
```

## 表格组件

- 使用 TanStack Table 8
- 服务端分页/搜索/过滤
- URL 状态用 Nuqs 管理
- 支持列排序、多选、批量操作

## 布局

- Sidebar (可折叠) + Header + Main
- 响应式设计 (mobile-first)
- Command+K 全局搜索 (cmdk)

## 无障碍

- 所有交互元素必须有 aria-label
- 键盘导航支持
- 颜色对比度符合 WCAG AA

## 禁止事项

- ❌ 手写原生 HTML 按钮/输入框
- ❌ 创建 .css/.scss/.less 文件
- ❌ 使用 JS 判断窗口宽度（用 Tailwind 响应式前缀）
- ❌ 组件超过 150 行不拆分
- ❌ 在组件中直接写 Prisma 查询
- ❌ 硬编码中文/英文文案（必须走 i18n）
- ❌ 将服务端数据存入 Zustand（用 TanStack Query）
