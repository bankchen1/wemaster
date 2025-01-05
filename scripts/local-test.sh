#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting local test environment...${NC}"

# 检查必要的工具
check_requirements() {
  echo -e "${YELLOW}Checking requirements...${NC}"
  
  # 检查 Docker
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    exit 1
  fi
  
  # 检查 Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed${NC}"
    exit 1
  fi
  
  # 检查 npm
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
  }
  
  echo -e "${GREEN}All requirements met${NC}"
}

# 设置环境变量
setup_env() {
  echo -e "${YELLOW}Setting up environment...${NC}"
  
  if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file from example${NC}"
  fi
  
  # 设置测试环境变量
  echo "NODE_ENV=development" >> .env
  echo "DATABASE_URL=postgresql://wepal:wepal_password@localhost:5432/wepal_test" >> .env
  echo "REDIS_URL=redis://localhost:6379" >> .env
}

# 启动依赖服务
start_dependencies() {
  echo -e "${YELLOW}Starting dependencies...${NC}"
  
  # 启动数据库和Redis
  docker-compose up -d postgres redis
  
  # 等待服务就绪
  echo -e "${YELLOW}Waiting for services to be ready...${NC}"
  sleep 10
}

# 初始化数据库
init_database() {
  echo -e "${YELLOW}Initializing database...${NC}"
  
  # 运行迁移
  npx prisma migrate reset --force
  
  # 添加测试数据
  npx prisma db seed
}

# 启动应用
start_app() {
  echo -e "${YELLOW}Starting application...${NC}"
  
  # 安装依赖
  npm install
  
  # 构建应用
  npm run build
  
  # 启动开发服务器
  npm run dev
}

# 运行测试
run_tests() {
  echo -e "${YELLOW}Running tests...${NC}"
  
  # 运行单元测试
  npm run test
  
  # 运行 E2E 测试
  npm run test:e2e
}

# 清理函数
cleanup() {
  echo -e "${YELLOW}Cleaning up...${NC}"
  
  # 停止所有容器
  docker-compose down
  
  # 删除测试数据库
  docker volume rm wepal_postgres_data
}

# 主函数
main() {
  check_requirements
  setup_env
  start_dependencies
  init_database
  start_app
  run_tests
  
  echo -e "${GREEN}Local test environment is ready!${NC}"
  echo -e "${GREEN}Access the application at http://localhost:3000${NC}"
  echo -e "${YELLOW}Press Ctrl+C to stop and cleanup${NC}"
  
  # 等待用户中断
  trap cleanup EXIT
  while true; do sleep 1; done
}

# 运行主函数
main
