# Change: 抽取通用技能到独立仓库 (Extract Common Skills)

## Why
当前 CRMALL 项目的 `skills/` 目录包含 9 个技能，其中部分技能是通用的、可跨项目复用的。需要将这些通用技能抽取到独立仓库 `aloneskills`，实现：
- 技能在多项目间共享
- 统一维护和版本管理
- 符合 Agent Skills 开放标准

## What Changes

### 需要抽取的通用技能 (Generic Skills)
| 技能 | 通用性 | 说明 |
|------|--------|------|
| `ui-ux-pro-max` | ⭐⭐⭐ 高 | UI/UX 设计智能，与项目无关 |
| `skill-creator` | ⭐⭐⭐ 高 | 技能创建指南，与项目无关 |
| `testing` | ⭐⭐ 中 | 测试规范，需移除项目特定配置 |
| `ui-components` | ⭐⭐ 中 | shadcn/ui 规范，需通用化 |
| `build-standards` | ⭐⭐ 中 | 构建规范，需移除特定路径 |
| `db-operations` | ⭐⭐ 中 | Prisma 规范，需移除连接信息 |
| `auth` | ⭐ 低 | 认证规范，需通用化 |
| `rbac` | ⭐ 低 | 权限规范，需通用化 |
| `feature-evaluation` | ⭐ 低 | 评估流程，需移除项目特定约束 |

### 抽取策略
1. **高通用性技能** - 直接复制，微调描述
2. **中通用性技能** - 移除项目特定配置（如数据库连接、路径）
3. **低通用性技能** - 抽象为通用模板，保留核心流程

## Impact
- **Affected repos**: 
  - `CRMALL` - 源项目
  - `aloneskills` - 目标仓库
- **Affected files**: 
  - `skills/*/SKILL.md`
  - `skills/*/references/*.md`

## Dependencies
- Git SSH 访问 `git@github.com:xx2468171796/aloneskills.git`
- Agent Skills 规范 (agentskills.io)

## Success Criteria
1. `aloneskills` 仓库包含通用化后的技能
2. 技能符合 Agent Skills 规范 (name, description)
3. 不包含 CRMALL 项目特定的配置信息
4. 可被其他项目直接引用
