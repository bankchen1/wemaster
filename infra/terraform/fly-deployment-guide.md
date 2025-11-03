# Fly.io 部署指南

由于 Fly.io 目前没有官方的 Terraform provider，需要手动配置部署。

## 1. 安装 Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

## 2. 登录 Fly.io

```bash
fly auth login
```

## 3. 创建 fly.toml 配置文件

在 `wemaster-nest` 目录中创建 `fly.toml`：

```toml
app = "wemaster-backend-dev"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"

[http_service]
  internal_port = 3001
  protocol = "tcp"

  [[http_service.checks]]
    grace_period = "30s"
    interval = "15s"
    method = "GET"
    path = "/healthz"
    protocol = "http"
    timeout = "10s"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

## 4. 创建 Dockerfile

在 `wemaster-nest` 目录中创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN npm run build
EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

## 5. 部署应用

```bash
cd /Volumes/BankChen/wemaster/wemaster-nest
fly launch
fly deploy
```

## 6. 配置环境变量

```bash
fly secrets set DATABASE_URL="your_neon_database_url"
fly secrets set REDIS_URL="your_upstash_redis_url"
fly secrets set JWT_SECRET="your_jwt_secret"
# ... 其他环境变量
```

## 7. 获取应用信息

```bash
fly status
fly info
```

## 输出信息

部署完成后，记录以下信息：
- 应用名称：wemaster-backend-dev
- 域名：wemaster-backend-dev.fly.dev
- IP 地址：通过 `fly ips list` 获取

将这些信息更新到 Terraform outputs 中。