# 配色方案参考

## CRMALL 默认主题

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

---

## 行业配色方案

### 金融科技 (Fintech)

| 角色 | 颜色 | Hex | Tailwind |
|------|------|-----|----------|
| Primary | 深蓝 | `#1E3A8A` | `blue-800` |
| Secondary | 浅灰 | `#F1F5F9` | `slate-100` |
| Accent | 翠绿 | `#10B981` | `emerald-500` |
| Warning | 琥珀 | `#F59E0B` | `amber-500` |
| Error | 红色 | `#EF4444` | `red-500` |

**氛围**: 专业、可信、稳重

---

### 医疗健康 (Healthcare)

| 角色 | 颜色 | Hex | Tailwind |
|------|------|-----|----------|
| Primary | 青绿 | `#0D9488` | `teal-600` |
| Secondary | 浅青 | `#F0FDFA` | `teal-50` |
| Accent | 蓝色 | `#3B82F6` | `blue-500` |
| Success | 绿色 | `#22C55E` | `green-500` |

**氛围**: 干净、专业、关怀

---

### 电商零售 (E-commerce)

| 角色 | 颜色 | Hex | Tailwind |
|------|------|-----|----------|
| Primary | 紫色 | `#7C3AED` | `violet-600` |
| Secondary | 浅紫 | `#FAF5FF` | `violet-50` |
| Accent | 橙色 | `#F59E0B` | `amber-500` |
| Sale | 红色 | `#EF4444` | `red-500` |

**氛围**: 活力、吸引力、转化导向

---

### 教育培训 (Education)

| 角色 | 颜色 | Hex | Tailwind |
|------|------|-----|----------|
| Primary | 蓝色 | `#2563EB` | `blue-600` |
| Secondary | 浅蓝 | `#EFF6FF` | `blue-50` |
| Accent | 绿色 | `#22C55E` | `green-500` |
| Progress | 黄色 | `#EAB308` | `yellow-500` |

**氛围**: 友好、启发、成长

---

### 美容健康 (Beauty/Wellness)

| 角色 | 颜色 | Hex | Tailwind |
|------|------|-----|----------|
| Primary | 玫瑰粉 | `#EC4899` | `pink-500` |
| Secondary | 浅粉 | `#FDF2F8` | `pink-50` |
| Accent | 金色 | `#D4AF37` | - |
| Calm | 薰衣草 | `#A78BFA` | `violet-400` |

**氛围**: 优雅、放松、奢华

---

## 状态颜色

| 状态 | 颜色 | Tailwind | 用途 |
|------|------|----------|------|
| Success | 绿色 | `green-500` | 成功提示、完成状态 |
| Warning | 琥珀 | `amber-500` | 警告、注意事项 |
| Error | 红色 | `red-500` | 错误、删除操作 |
| Info | 蓝色 | `blue-500` | 信息提示 |

---

## 对比度要求

WCAG AA 标准要求:
- 正常文本: ≥4.5:1
- 大文本 (≥18px 粗体): ≥3:1
- UI 组件: ≥3:1

**推荐组合**:

| 背景 | 文本 | 对比度 |
|------|------|--------|
| `white` | `slate-900` | 15.8:1 ✅ |
| `white` | `slate-600` | 5.5:1 ✅ |
| `white` | `slate-400` | 3.0:1 ⚠️ |
| `slate-900` | `slate-100` | 13.5:1 ✅ |
