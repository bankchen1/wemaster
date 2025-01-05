#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查环境变量
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# 加载环境变量
source .env

echo -e "${YELLOW}Starting deployment process...${NC}"

# 停止现有服务
echo -e "${YELLOW}Stopping existing services...${NC}"
docker-compose down

# 备份数据库
echo -e "${YELLOW}Backing up database...${NC}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
docker-compose exec -T postgres pg_dump -U wepal > "./backups/$BACKUP_FILE"

# 拉取最新代码
echo -e "${YELLOW}Pulling latest code...${NC}"
git pull origin main

# 安装依赖
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# 构建应用
echo -e "${YELLOW}Building applications...${NC}"
npm run build

# 运行数据库迁移
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy

# 启动服务
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# 检查服务健康状态
echo -e "${YELLOW}Checking service health...${NC}"
./scripts/health-check.sh

# 清理旧备份和日志
echo -e "${YELLOW}Cleaning up old files...${NC}"
find ./backups -name "backup_*.sql" -mtime +7 -delete
find ./logs -name "*.log" -mtime +30 -delete

echo -e "${GREEN}Deployment completed successfully!${NC}"
