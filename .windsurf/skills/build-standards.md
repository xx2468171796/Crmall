---
description: 打包构建规范技能。在需要配置开发环境、生产构建、Docker 镜像、Tauri 桌面端、环境变量等时使用此技能。基于 Turbopack + Next.js Standalone + Tauri v2 + Docker。
---

# 打包构建技能

阅读 `skills/build-standards/SKILL.md` 获取完整指南。

## 快速参考

### 开发环境
```bash
yarn dev  # 必须使用 Turbopack
```

### 生产构建
```bash
yarn build  # output: standalone
```

### Docker
```bash
docker build -t crmall:latest .
docker run -p 3000:3000 --env-file .env crmall:latest
```

### Tauri 桌面端
```bash
yarn tauri dev    # 开发
yarn tauri build  # 生产
```

### 环境变量
```
.env.example      # 模板（提交）
.env.local        # 本地（不提交）
.env.production   # 生产（不提交）
```

### 约束
- ✅ 开发必须用 `--turbo`
- ✅ 生产用 Standalone
- ✅ 文件操作用 Tauri Command
- ❌ 禁止 Node.js fs
