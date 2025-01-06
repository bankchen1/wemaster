# Wepal Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 16+ and npm
- PostgreSQL 14+
- Redis 7+

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/wepal.git
cd wepal
```

2. Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate JWT secret:
```bash
openssl rand -base64 32
# Add the output to JWT_SECRET in .env
```

## Jitsi Meet Setup

1. Configure DNS:
   - Point your domain (e.g., meet.example.com) to your server
   - Ensure SSL certificates are properly set up

2. Configure Jitsi Meet:
   - Edit docker-compose.yml with your domain
   - Update JITSI_* variables in .env

3. Initialize Jitsi Meet:
```bash
docker-compose up -d jitsi-meet
```

## Matrix Synapse Setup

1. Generate configuration:
```bash
docker-compose run --rm -e SYNAPSE_SERVER_NAME=matrix.example.com \
  -e SYNAPSE_REPORT_STATS=no matrix-synapse generate
```

2. Configure Matrix:
   - Edit homeserver.yaml in matrix_data volume
   - Update MATRIX_* variables in .env

3. Initialize Matrix:
```bash
docker-compose up -d matrix-synapse
```

## Database Setup

1. Initialize PostgreSQL:
```bash
docker-compose up -d postgres
```

2. Run migrations:
```bash
npx prisma migrate deploy
```

## Application Deployment

1. Build applications:
```bash
# Build web app
cd apps/web
npm install
npm run build

# Build API
cd ../api
npm install
npm run build
```

2. Start all services:
```bash
docker-compose up -d
```

## Monitoring Setup

1. Configure Elastic APM:
   - Update ELASTIC_APM_* variables in .env
   - Ensure Elasticsearch has enough memory

2. Access monitoring:
   - Kibana: http://your-server:5601
   - APM: http://your-server:8200

## Security Considerations

1. Firewall Configuration:
   - Allow only necessary ports
   - Use reverse proxy for SSL termination

2. SSL/TLS:
   - Use Let's Encrypt or your SSL provider
   - Configure SSL in nginx/reverse proxy

3. Authentication:
   - Configure JWT secret
   - Set up Matrix user registration policy

## Backup Strategy

1. Database Backup:
```bash
# Automated backup script
docker-compose exec postgres pg_dump -U wepal > backup.sql
```

2. Volume Backup:
```bash
# Backup all docker volumes
docker run --rm -v /var/lib/docker:/var/lib/docker \
  -v /backup:/backup ubuntu tar czf /backup/volumes.tar.gz \
  /var/lib/docker/volumes
```

## Troubleshooting

1. Check logs:
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs api
```

2. Common Issues:
   - Matrix federation issues: Check SRV records
   - Jitsi connection issues: Check WebSocket configuration
   - Database connection: Check DATABASE_URL

## Scaling

1. Horizontal Scaling:
   - Use container orchestration (Kubernetes)
   - Configure load balancer

2. Vertical Scaling:
   - Increase container resources
   - Optimize database queries

## Maintenance

1. Updates:
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

2. Monitoring:
   - Set up alerts in Kibana
   - Monitor system resources

## Support

For issues and support:
- GitHub Issues: [Repository Issues](https://github.com/your-org/wepal/issues)
- Documentation: [Project Wiki](https://github.com/your-org/wepal/wiki)

## Vercel 部署

### 前端部署 (apps/web)

1. Vercel 项目设置：
```bash
# 在 apps/web 目录下初始化 Vercel
vercel init

# 配置项目
vercel link
```

2. 环境变量配置：
   - `NEXT_PUBLIC_API_URL`: 后端 API 地址
   - `NEXT_PUBLIC_WS_URL`: WebSocket 服务地址
   - `NEXT_PUBLIC_JITSI_SERVER`: Jitsi Meet 服务器地址
   - `NEXT_PUBLIC_STRIPE_KEY`: Stripe 公钥

3. 部署命令：
```bash
vercel --prod
```

### 后端部署 (apps/api)

1. 数据库配置：
```bash
# 创建数据库
createdb wemaster_prod

# 运行迁移
npm run migration:run
```

2. 环境变量配置：
   - `DATABASE_URL`: PostgreSQL 连接字符串
   - `REDIS_URL`: Redis 连接字符串
   - `JWT_SECRET`: JWT 密钥
   - `STRIPE_SECRET_KEY`: Stripe 密钥
   - `AWS_ACCESS_KEY`: AWS 访问密钥
   - `AWS_SECRET_KEY`: AWS 密钥

3. PM2 部署：
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js --env production
```

## Docker 部署

### 使用 Docker Compose

1. 构建镜像：
```bash
docker-compose build
```

2. 启动服务：
```bash
docker-compose up -d
```

3. 数据库迁移：
```bash
docker-compose exec api npm run migration:run
```

### Kubernetes 部署

1. 创建 Kubernetes 配置：
```bash
kubectl apply -f k8s/
```

2. 检查部署状态：
```bash
kubectl get pods
kubectl get services
```

## CI/CD 配置

### GitHub Actions

1. 前端部署流程：
```yaml
name: Frontend CI/CD
on:
  push:
    branches: [ main ]
    paths:
      - 'apps/web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

2. 后端部署流程：
```yaml
name: Backend CI/CD
on:
  push:
    branches: [ main ]
    paths:
      - 'apps/api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/wemaster
            git pull
            npm install
            npm run build
            pm2 restart all
```

## 监控配置

### 性能监控

1. 安装 New Relic：
```bash
npm install newrelic --save
```

2. 配置 PM2 监控：
```bash
pm2 install pm2-server-monit
```

### 日志管理

1. 配置 ELK Stack：
```yaml
# docker-compose.elk.yml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.9.3
  logstash:
    image: docker.elastic.co/logstash/logstash:7.9.3
  kibana:
    image: docker.elastic.co/kibana/kibana:7.9.3
```

## 备份策略

### 数据库备份

1. 自动备份脚本：
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U postgres wemaster_prod > backup_${TIMESTAMP}.sql
aws s3 cp backup_${TIMESTAMP}.sql s3://wemaster-backups/
```

2. 配置定时任务：
```bash
0 0 * * * /path/to/backup.sh
```
