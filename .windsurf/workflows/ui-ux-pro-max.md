---
description: AI 驱动的设计智能技能。当需要构建 UI/UX（设计、创建、实现、审查、修复、改进界面）时使用此技能。提供 UI 风格、配色方案、字体搭配、图表类型和 UX 指南的智能推荐。基于 shadcn/ui + Tailwind CSS v4。
---

阅读 `skills/ui-ux-pro-max/SKILL.md` 获取完整指南。

## 快速参考

### UI 风格选择
| 风格 | 适用场景 | Tailwind |
|------|----------|----------|
| Glassmorphism | SaaS、金融 | `bg-white/10 backdrop-blur-lg` |
| Minimalism | 企业、文档 | `bg-white shadow-sm` |
| Soft UI | 现代企业 | `shadow-lg rounded-2xl` |
| Bento Grid | 仪表板 | `grid grid-cols-4 gap-4` |
| Dark Mode | 开发工具 | `bg-slate-900 text-slate-100` |

### 行业配色
| 行业 | 主色 | Tailwind |
|------|------|----------|
| 金融科技 | 深蓝 | `blue-800` |
| 医疗健康 | 青绿 | `teal-600` |
| 电商零售 | 紫色 | `violet-600` |
| 教育培训 | 蓝色 | `blue-600` |
| 美容健康 | 粉色 | `pink-500` |

### 交付检查
- [ ] 无 Emoji 图标 (用 Lucide)
- [ ] cursor-pointer 在可点击元素
- [ ] hover 过渡 150-300ms
- [ ] 对比度 ≥4.5:1
- [ ] 响应式 375/768/1024/1440px
