#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 加载环境变量
source .env

# 检查API服务
check_api() {
    echo -e "${YELLOW}Checking API service...${NC}"
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health)
    if [ $response -eq 200 ]; then
        echo -e "${GREEN}API service is healthy${NC}"
        return 0
    else
        echo -e "${RED}API service is not responding properly${NC}"
        return 1
    fi
}

# 检查Web服务
check_web() {
    echo -e "${YELLOW}Checking Web service...${NC}"
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [ $response -eq 200 ]; then
        echo -e "${GREEN}Web service is healthy${NC}"
        return 0
    else
        echo -e "${RED}Web service is not responding properly${NC}"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    echo -e "${YELLOW}Checking database connection...${NC}"
    if docker-compose exec postgres pg_isready -U wepal; then
        echo -e "${GREEN}Database is healthy${NC}"
        return 0
    else
        echo -e "${RED}Database is not responding${NC}"
        return 1
    fi
}

# 检查Redis连接
check_redis() {
    echo -e "${YELLOW}Checking Redis connection...${NC}"
    if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}Redis is healthy${NC}"
        return 0
    else
        echo -e "${RED}Redis is not responding${NC}"
        return 1
    fi
}

# 检查Jitsi Meet服务
check_jitsi() {
    echo -e "${YELLOW}Checking Jitsi Meet service...${NC}"
    response=$(curl -s -o /dev/null -w "%{http_code}" https://$JITSI_DOMAIN)
    if [ $response -eq 200 ]; then
        echo -e "${GREEN}Jitsi Meet service is healthy${NC}"
        return 0
    else
        echo -e "${RED}Jitsi Meet service is not responding properly${NC}"
        return 1
    fi
}

# 检查Matrix服务
check_matrix() {
    echo -e "${YELLOW}Checking Matrix service...${NC}"
    response=$(curl -s -o /dev/null -w "%{http_code}" $MATRIX_HOMESERVER_URL/_matrix/client/versions)
    if [ $response -eq 200 ]; then
        echo -e "${GREEN}Matrix service is healthy${NC}"
        return 0
    else
        echo -e "${RED}Matrix service is not responding properly${NC}"
        return 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    echo -e "${YELLOW}Checking disk space...${NC}"
    threshold=90
    usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -lt $threshold ]; then
        echo -e "${GREEN}Disk space is sufficient${NC}"
        return 0
    else
        echo -e "${RED}Warning: Disk space usage is above ${threshold}%${NC}"
        return 1
    fi
}

# 检查内存使用
check_memory() {
    echo -e "${YELLOW}Checking memory usage...${NC}"
    threshold=90
    usage=$(free | awk '/Mem/{printf("%.0f"), $3/$2*100}')
    if [ $usage -lt $threshold ]; then
        echo -e "${GREEN}Memory usage is normal${NC}"
        return 0
    else
        echo -e "${RED}Warning: Memory usage is above ${threshold}%${NC}"
        return 1
    fi
}

# 运行所有检查
run_all_checks() {
    failed=0
    
    check_api || ((failed++))
    check_web || ((failed++))
    check_database || ((failed++))
    check_redis || ((failed++))
    check_jitsi || ((failed++))
    check_matrix || ((failed++))
    check_disk_space || ((failed++))
    check_memory || ((failed++))
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}All services are healthy!${NC}"
        exit 0
    else
        echo -e "${RED}${failed} service(s) reported issues${NC}"
        exit 1
    fi
}

# 主函数
main() {
    if [ "$1" ]; then
        case $1 in
            "api") check_api ;;
            "web") check_web ;;
            "db") check_database ;;
            "redis") check_redis ;;
            "jitsi") check_jitsi ;;
            "matrix") check_matrix ;;
            "disk") check_disk_space ;;
            "memory") check_memory ;;
            *) echo "Unknown service: $1" ;;
        esac
    else
        run_all_checks
    fi
}

main "$@"
