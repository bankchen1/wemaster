#!/usr/bin/env bash
set -euo pipefail

# M5 Staging 环境一键回滚脚本
# 作者: DevOps Team
# 版本: v1.0
# 日期: 2025-11-02

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 检查必要工具
check_dependencies() {
    log_info "检查依赖工具..."
    
    local deps=("fly" "git" "curl" "jq")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "缺少必要工具: $dep"
            exit 1
        fi
    done
    
    log_success "依赖工具检查完成"
}

# 备份当前状态
backup_current_state() {
    log_info "备份当前状态..."
    
    local backup_dir="backups/rollback-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # 备份当前配置
    fly secrets list -a wemaster-staging-api > "$backup_dir/current-secrets.txt" 2>/dev/null || true
    cp fly.toml "$backup_dir/" 2>/dev/null || true
    git log --oneline -5 > "$backup_dir/git-history.txt" 2>/dev/null || true
    
    # 备份当前镜像版本
    fly scale show -a wemaster-staging-api > "$backup_dir/current-scale.txt" 2>/dev/null || true
    
    log_success "当前状态备份完成: $backup_dir"
    echo "$backup_dir"
}

# 获取上一个稳定版本
get_previous_stable_version() {
    log_info "获取上一个稳定版本..."
    
    # 获取上一个稳定commit
    local previous_commit=$(git log --oneline -10 | grep -E "(stable|release|prod)" | head -1 | cut -d' ' -f1)
    
    if [[ -z "$previous_commit" ]]; then
        # 如果没有找到stable标记，使用HEAD~1
        previous_commit=$(git rev-parse HEAD~1)
    fi
    
    log_success "上一个稳定版本: $previous_commit"
    echo "$previous_commit"
}

# 回滚代码版本
rollback_code() {
    local target_commit="$1"
    log_info "回滚代码到版本: $target_commit"
    
    # 检查当前是否有未提交的更改
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log_warning "发现未提交的更改，正在暂存..."
        git stash push -m "rollback-stash-$(date +%Y%m%d_%H%M%S)"
    fi
    
    # 回滚到指定版本
    git checkout "$target_commit"
    
    log_success "代码回滚完成"
}

# 回滚后端服务
rollback_backend() {
    log_info "回滚后端服务..."
    
    # 停止当前服务
    log_info "停止后端服务..."
    fly apps stop wemaster-staging-api || true
    
    # 重新构建和部署
    log_info "重新构建和部署后端..."
    cd wemaster-nest
    
    # 恢复上一个版本的依赖
    npm ci
    
    # 重新构建
    npm run build
    
    # 部署
    fly deploy --app wemaster-staging-api
    
    cd ..
    
    # 等待服务启动
    log_info "等待后端服务启动..."
    sleep 30
    
    log_success "后端服务回滚完成"
}

# 回滚前端服务
rollback_frontend() {
    log_info "回滚前端服务..."
    
    # 停止前端服务
    log_info "停止前端服务..."
    fly apps stop wemaster-staging-admin || true
    
    # 重新构建和部署
    log_info "重新构建和部署前端..."
    cd wemaster-admin
    
    # 恢复上一个版本的依赖
    npm ci
    
    # 重新构建
    npm run build
    
    # 部署
    fly deploy --app wemaster-staging-admin
    
    cd ..
    
    # 等待服务启动
    log_info "等待前端服务启动..."
    sleep 20
    
    log_success "前端服务回滚完成"
}

# 回滚数据库（可选）
rollback_database() {
    log_warning "数据库回滚需要手动确认，继续？(y/N)"
    read -r confirm
    
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        log_info "跳过数据库回滚"
        return 0
    fi
    
    log_info "回滚数据库..."
    
    # 获取最新的备份文件
    local latest_backup=$(fly s3 ls backup:// | grep "wemaster-staging-backup" | sort -r | head -1 | awk '{print $4}')
    
    if [[ -z "$latest_backup" ]]; then
        log_error "未找到数据库备份文件"
        return 1
    fi
    
    log_info "使用备份文件: $latest_backup"
    
    # 停止应用服务
    fly apps stop wemaster-staging-api
    
    # 恢复数据库
    fly s3 get "backup://$latest_backup" | \
    fly postgres connect -a wemaster-staging-db -c "psql wemaster_staging"
    
    # 重启应用服务
    fly apps start wemaster-staging-api
    
    log_success "数据库回滚完成"
}

# 验证回滚结果
verify_rollback() {
    log_info "验证回滚结果..."
    
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        # 检查后端健康状态
        if curl -f https://api-staging.wemaster.com/healthz &>/dev/null; then
            log_success "后端服务健康检查通过"
            break
        fi
        
        attempt=$((attempt + 1))
        log_info "等待服务启动... ($attempt/$max_attempts)"
        sleep 10
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        log_error "后端服务启动超时"
        return 1
    fi
    
    # 检查前端服务
    if curl -f https://admin-staging.wemaster.com &>/dev/null; then
        log_success "前端服务健康检查通过"
    else
        log_error "前端服务健康检查失败"
        return 1
    fi
    
    # 检查数据库连接
    if fly postgres connect -a wemaster-staging-db -c "SELECT 1;" &>/dev/null; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        return 1
    fi
    
    log_success "回滚验证完成"
}

# 生成回滚报告
generate_rollback_report() {
    local backup_dir="$1"
    local target_commit="$2"
    
    log_info "生成回滚报告..."
    
    local report_file="logs/rollback-report-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# M5 Staging 环境回滚报告

## 回滚信息
- **回滚时间**: $(date '+%Y-%m-%d %H:%M:%S')
- **目标版本**: $target_commit
- **备份目录**: $backup_dir
- **执行人员**: $(whoami)

## 回滚步骤
1. ✅ 备份当前状态
2. ✅ 回滚代码版本
3. ✅ 回滚后端服务
4. ✅ 回滚前端服务
EOF

    if [[ "${ROLLBACK_DB:-false}" == "true" ]]; then
        echo "5. ✅ 回滚数据库" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF
6. ✅ 验证回滚结果

## 验证结果
- **后端服务**: ✅ 正常
- **前端服务**: ✅ 正常
- **数据库**: ✅ 正常

## 当前版本信息
\`\`\`
$(git log --oneline -1)
\`\`\`

## 服务状态
\`\`\`
$(fly status)
\`\`\`

---

**报告生成时间**: $(date '+%Y-%m-%d %H:%M:%S')
EOF

    log_success "回滚报告生成完成: $report_file"
}

# 主函数
main() {
    log_info "开始 M5 Staging 环境回滚..."
    
    # 检查依赖
    check_dependencies
    
    # 备份当前状态
    local backup_dir=$(backup_current_state)
    
    # 获取目标版本
    local target_commit="${1:-}"
    if [[ -z "$target_commit" ]]; then
        target_commit=$(get_previous_stable_version)
    fi
    
    # 确认回滚
    log_warning "即将回滚到版本: $target_commit"
    log_warning "这将影响所有 staging 环境，确认继续？(y/N)"
    read -r confirm
    
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        log_info "取消回滚操作"
        exit 0
    fi
    
    # 执行回滚
    rollback_code "$target_commit"
    rollback_backend
    rollback_frontend
    
    # 可选的数据库回滚
    if [[ "${ROLLBACK_DB:-false}" == "true" ]]; then
        rollback_database
    fi
    
    # 验证回滚
    if verify_rollback; then
        log_success "回滚成功完成！"
        generate_rollback_report "$backup_dir" "$target_commit"
    else
        log_error "回滚验证失败，请检查日志"
        exit 1
    fi
    
    log_success "M5 Staging 环境回滚完成"
}

# 显示帮助信息
show_help() {
    cat << EOF
M5 Staging 环境一键回滚脚本

用法:
  $0 [commit_hash]    # 回滚到指定commit
  $0 -h              # 显示帮助信息

环境变量:
  ROLLBACK_DB=true   # 同时回滚数据库

示例:
  $0                 # 回滚到上一个稳定版本
  $0 abc123def       # 回滚到指定commit
  ROLLBACK_DB=true $0 # 回滚并包含数据库

EOF
}

# 脚本入口
if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    show_help
    exit 0
fi

# 执行主函数
main "$@"