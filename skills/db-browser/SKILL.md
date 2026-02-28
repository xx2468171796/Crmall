# DB Browser 技能 — 数据库浏览器（Windows 本地开发环境）

## 环境信息
- OS: Windows 10
- psql: `C:\Program Files\PostgreSQL\18\bin\psql.exe`
- 数据库: PostgreSQL 17 @ 192.168.110.246:5433
- DB Name: crmall0125
- User: crmall0125
- Password: xx123654

## 连接命令模板

所有 psql 命令必须使用以下格式：

```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -c "YOUR_SQL_HERE"
```

## 常用操作

### 查看所有 Schema
```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','pg_toast','information_schema') ORDER BY schema_name;"
```

### 查看某个 Schema 下的所有表
```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth' ORDER BY table_name;"
```

### 查看表结构
```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -c "\d auth.users"
```

### 查询数据（带格式化）
```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -c "SELECT * FROM auth.users LIMIT 10;"
```

### 统计行数
```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -c "SELECT count(*) FROM auth.users;"
```

### 创建 Schema
```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -c "CREATE SCHEMA IF NOT EXISTS ordering;"
```

### 执行多行 SQL（用 -f 文件）
```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -f "path/to/script.sql"
```

### 导出查询结果为 CSV
```powershell
$env:PGPASSWORD="xx123654"; & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 192.168.110.246 -p 5433 -U crmall0125 -d crmall0125 -c "\COPY (SELECT * FROM auth.users) TO 'output.csv' WITH CSV HEADER"
```

## Redis 操作

Redis CLI 未安装在本地。可通过以下方式操作：

### 方式 1：通过 Docker（如果有）
```powershell
docker run --rm redis:7 redis-cli -h 192.168.110.246 -p 6379 -a xx123654 ping
```

### 方式 2：通过 Node.js 脚本
```powershell
npx -y ioredis-cli -h 192.168.110.246 -p 6379 -a xx123654
```

### 方式 3：安装 redis-cli（推荐）
```powershell
winget install Redis.RedisInsight
```

## MinIO 操作

### 通过 mc (MinIO Client)
```powershell
# 安装
winget install MinIO.Client

# 配置
mc alias set twcrm http://192.168.110.246:9000 OGt2EahfvShE8yYh0a3i svB22CuhcjFtGLmhfYi3rUasa2lIQd7MuZ2W4RT7

# 列出文件
mc ls twcrm/crmall0125

# 上传文件
mc cp local-file.jpg twcrm/crmall0125/uploads/
```

### 通过浏览器
MinIO Console: http://192.168.110.246:9000
- Access Key: OGt2EahfvShE8yYh0a3i
- Secret Key: svB22CuhcjFtGLmhfYi3rUasa2lIQd7MuZ2W4RT7

## Prisma Studio（可视化数据库浏览器）

Prisma 自带的 GUI 数据库浏览器：

```powershell
cd packages/db
pnpm exec prisma studio
```

自动打开浏览器 http://localhost:5555，可以可视化浏览/编辑所有表数据。

## 注意事项
- 所有 psql 命令必须先设置 `$env:PGPASSWORD`
- 查询大表时必须加 `LIMIT`，避免卡死
- 写操作（INSERT/UPDATE/DELETE）需要确认后再执行
- 生产环境禁止直接 SQL 操作，必须通过 Prisma Migration
