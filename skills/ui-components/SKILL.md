---
name: ui-components
description: UI 组件开发技能。在需要创建页面、组件、表单、表格、弹窗等 UI 元素时使用此技能。基于 shadcn/ui + Tailwind CSS v4 + React 19 + 原子化设计模式。
---

# UI 组件技能 (UI Components Skill)

创建 UI 组件时，遵循原子化设计模式和项目规范。

## 技术栈

- **React 19** - UI 框架
- **shadcn/ui** - 组件库
- **Tailwind CSS v4** - 样式引擎
- **Lucide React** - 图标库
- **React Hook Form** + **Zod** - 表单处理

## 组件层级结构

```
src/components/
├── ui/           # Atoms - shadcn 基础组件
├── shared/       # Molecules - 业务通用组件
└── features/     # Organisms - 特定业务模块
```

### Atoms (原子组件)

最基础的 UI 元素，直接使用 shadcn/ui。

```bash
# 添加 shadcn 组件
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
```

### Molecules (分子组件)

组合多个原子组件，形成可复用的业务组件。

```tsx
// src/components/shared/search-input.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchInputProps {
  placeholder?: string
  onSearch: (value: string) => void
}

export function SearchInput({ placeholder, onSearch }: SearchInputProps) {
  return (
    <div className="flex gap-2">
      <Input placeholder={placeholder} />
      <Button size="icon" variant="outline">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### Organisms (组织组件)

完整的业务功能模块，可包含状态和副作用。

```tsx
// src/components/features/customer-table.tsx
"use client"

import { useQuery } from "@tanstack/react-query"
import { getCustomers } from "@/actions/customer"
import { DataTable } from "@/components/shared/data-table"
import { columns } from "./columns"

export function CustomerTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  })

  if (isLoading) return <Skeleton />
  
  return <DataTable columns={columns} data={data ?? []} />
}
```

## 核心规范

### 1. 组件大小限制

单个组件文件 **不超过 150 行**。超过则拆分。

### 2. 单一职责

- UI 组件只负责展示
- 业务逻辑抽离到 Hooks
- 数据获取抽离到 Server Actions

### 3. 样式规范

```tsx
// ✅ 正确 - 使用 Tailwind
<div className="flex items-center gap-4 p-4 rounded-lg bg-card">

// ❌ 错误 - 禁止内联样式
<div style={{ display: 'flex', padding: '16px' }}>

// ❌ 错误 - 禁止 CSS 文件
import "./styles.css"
```

### 4. 响应式设计

```tsx
// 使用 Tailwind 响应式前缀
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### 5. 图标使用

```tsx
// 统一使用 Lucide React
import { User, Settings, LogOut } from "lucide-react"
```

## 表单模板

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { customerSchema, type CustomerFormData } from "@/schemas/customer"

export function CustomerForm() {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "" },
  })

  const onSubmit = async (data: CustomerFormData) => {
    // 调用 Server Action
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>客户名称</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">保存</Button>
      </form>
    </Form>
  )
}
```

## 禁止事项

- ❌ 手写原生 HTML 按钮/输入框
- ❌ 创建 .css/.scss/.less 文件
- ❌ 使用 JS 判断窗口宽度
- ❌ 组件超过 150 行不拆分
- ❌ 在组件中直接写 SQL
