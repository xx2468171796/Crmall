# UI 风格详解

## 1. Glassmorphism (玻璃拟态)

**适用场景**: 现代 SaaS、金融仪表板、科技产品

```tsx
<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
  {/* 内容 */}
</div>
```

**关键属性**:
- `backdrop-blur-lg` - 模糊背景
- `bg-white/10` - 半透明白色 (暗色模式)
- `bg-white/80` - 半透明白色 (浅色模式)
- `border-white/20` - 半透明边框

**注意**: 浅色模式需要提高不透明度 (`bg-white/80`)

---

## 2. Minimalism (极简主义)

**适用场景**: 企业应用、文档、管理后台

```tsx
<div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
  {/* 内容 */}
</div>
```

**关键属性**:
- 大量留白
- 单色或双色配色
- 清晰的层次结构
- 无装饰性元素

---

## 3. Neumorphism (新拟态)

**适用场景**: 健康/冥想应用、计算器、控制面板

```tsx
<div className="bg-gray-100 rounded-2xl shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
  {/* 内容 */}
</div>
```

**注意**: 对比度较低，不适合大量文本

---

## 4. Soft UI (柔和 UI)

**适用场景**: 现代企业应用、SaaS 仪表板

```tsx
<div className="bg-white/80 shadow-lg rounded-2xl border border-gray-100 p-6">
  {/* 内容 */}
</div>
```

**关键属性**:
- 柔和阴影
- 圆角 (rounded-2xl)
- 微妙边框
- 有机形状

---

## 5. Bento Grid (便当盒布局)

**适用场景**: 仪表板、产品功能页、个人作品集

```tsx
<div className="grid grid-cols-4 gap-4">
  <div className="col-span-2 row-span-2 bg-primary rounded-3xl p-6">
    {/* 主要内容 */}
  </div>
  <div className="col-span-1 bg-secondary rounded-3xl p-4">
    {/* 次要内容 */}
  </div>
  <div className="col-span-1 bg-muted rounded-3xl p-4">
    {/* 次要内容 */}
  </div>
</div>
```

---

## 6. Dark Mode (暗色模式)

**适用场景**: 开发工具、夜间应用、视频平台

```tsx
<div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-lg">
  {/* 内容 */}
</div>
```

**关键属性**:
- 主背景: `bg-slate-900` 或 `bg-zinc-900`
- 卡片: `bg-slate-800`
- 文本: `text-slate-100`
- 边框: `border-slate-700`

---

## 7. AI-Native UI

**适用场景**: AI 产品、聊天机器人、Copilot

```tsx
<div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 
                border border-violet-500/20 rounded-2xl backdrop-blur-sm">
  {/* 内容 */}
</div>
```

**特征**:
- 渐变背景
- 紫/粉色调
- 流动动画
- 打字机效果

---

## 8. Brutalism (粗野主义)

**适用场景**: 设计作品集、艺术项目、创意网站

```tsx
<div className="bg-yellow-400 border-4 border-black shadow-[8px_8px_0_0_#000] p-6">
  {/* 内容 */}
</div>
```

**关键属性**:
- 粗边框
- 硬阴影
- 高对比度颜色
- 不规则布局
