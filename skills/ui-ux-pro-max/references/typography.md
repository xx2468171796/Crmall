# 字体搭配参考

## 推荐字体组合

### 1. 现代专业 (Default)

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
font-family: 'Inter', system-ui, sans-serif;
```

**适用**: 企业应用、SaaS、仪表板

---

### 2. 优雅奢华

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
```

```css
/* 标题 */
font-family: 'Playfair Display', serif;

/* 正文 */
font-family: 'Lato', sans-serif;
```

**适用**: 奢侈品、美容、高端服务

---

### 3. 科技极客

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

```css
/* 代码/数字 */
font-family: 'JetBrains Mono', monospace;

/* 正文 */
font-family: 'Inter', sans-serif;
```

**适用**: 开发工具、技术产品、加密货币

---

### 4. 友好活泼

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
```

```css
/* 标题 */
font-family: 'Poppins', sans-serif;

/* 正文 */
font-family: 'Open Sans', sans-serif;
```

**适用**: 教育、儿童、消费品

---

### 5. 中文优先

```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

**适用**: 中文为主的应用

---

### 6. 编辑/杂志风

```html
<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet">
```

```css
/* 标题 */
font-family: 'Merriweather', serif;

/* 正文 */
font-family: 'Source Sans Pro', sans-serif;
```

**适用**: 新闻、博客、内容平台

---

## 字体大小规范 (Tailwind)

| 角色 | 类名 | 大小 | 行高 |
|------|------|------|------|
| 超大标题 | `text-4xl` | 2.25rem | 2.5rem |
| 大标题 | `text-3xl` | 1.875rem | 2.25rem |
| 标题 | `text-2xl` | 1.5rem | 2rem |
| 小标题 | `text-xl` | 1.25rem | 1.75rem |
| 正文 | `text-base` | 1rem | 1.5rem |
| 小字 | `text-sm` | 0.875rem | 1.25rem |
| 极小 | `text-xs` | 0.75rem | 1rem |

---

## 字重规范

| 用途 | 类名 | 字重 |
|------|------|------|
| 正文 | `font-normal` | 400 |
| 强调 | `font-medium` | 500 |
| 标题 | `font-semibold` | 600 |
| 重要标题 | `font-bold` | 700 |

---

## Next.js 配置示例

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

```ts
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```
