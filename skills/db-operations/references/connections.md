# CRMALL 数据库连接信息

## 🔐 统一管理账户

- **默认用户名**: `admin`
- **默认密码**: `xx123654`

## 🛠 服务概览

| 服务 | IP | 端口 | 用途 |
|------|-----|------|------|
| PostgreSQL | 192.168.110.246 | 5433 | 主数据库 |
| Redis | 192.168.110.246 | 6379 | 缓存/Session |
| MinIO | 192.168.110.246 | 9000 | 对象存储 |

## PostgreSQL

```env
DATABASE_URL="postgres://crmall0125:xx123654@192.168.110.246:5433/crmall0125"
```

| 参数 | 值 |
|------|-----|
| Host | `192.168.110.246` |
| Port | `5433` |
| Database | `crmall0125` |
| User | `crmall0125` |
| Password | `xx123654` |

### 测试连接

```bash
psql "postgres://crmall0125:xx123654@192.168.110.246:5433/crmall0125"
```

## Redis

```env
REDIS_URL="redis://:xx123654@192.168.110.246:6379"
```

| 参数 | 值 |
|------|-----|
| Host | `192.168.110.246` |
| Port | `6379` |
| Password | `xx123654` |

### 测试连接

```bash
redis-cli -h 192.168.110.246 -p 6379 -a xx123654 ping
```

## MinIO

| 参数 | 值 |
|------|-----|
| Endpoint | `http://192.168.110.246:9000` |
| Bucket | `crmall0125` |
| Access Key | `OGt2EahfvShE8yYh0a3i` |
| Secret Key | `svB22CuhcjFtGLmhfYi3rUasa2lIQd7MuZ2W4RT7` |

```env
MINIO_ENDPOINT=192.168.110.246
MINIO_PORT=9000
MINIO_BUCKET=crmall0125
MINIO_ACCESS_KEY=OGt2EahfvShE8yYh0a3i
MINIO_SECRET_KEY=svB22CuhcjFtGLmhfYi3rUasa2lIQd7MuZ2W4RT7
```

## 完整 .env 示例

```env
# Database
DATABASE_URL="postgres://crmall0125:xx123654@192.168.110.246:5433/crmall0125"

# Redis
REDIS_URL="redis://:xx123654@192.168.110.246:6379"

# MinIO
MINIO_ENDPOINT=192.168.110.246
MINIO_PORT=9000
MINIO_BUCKET=crmall0125
MINIO_ACCESS_KEY=OGt2EahfvShE8yYh0a3i
MINIO_SECRET_KEY=svB22CuhcjFtGLmhfYi3rUasa2lIQd7MuZ2W4RT7
```
