#!/bin/bash

# WeMaster 数据库回滚脚本
set -e

# 配置参数
ENVIRONMENT=${1:-staging}
BACKUP_FILE=${2:-""}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/tmp/wemaster-db-backup-$TIMESTAMP"
LOG_FILE="/var/log/wemaster-db-rollback.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# 检查前置条件
check_prerequisites() {
    log "检查数据库回滚前置条件..."
    
    # 检查环境参数
    if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
        log_error "无效的环境参数: $ENVIRONMENT"
        exit 1
    fi
    
    # 检查必要工具
    if ! command -v psql &> /dev/null; then
        log_error "缺少 psql 工具"
        exit 1
    fi
    
    if ! command -v doppler &> /dev/null; then
        log_error "缺少 doppler 工具"
        exit 1
    fi
    
    # 检查数据库连接
    if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        log_error "数据库连接失败"
        exit 1
    fi
    
    log_success "前置条件检查通过"
}

# 创建当前数据库备份
create_backup() {
    log "创建当前数据库备份..."
    
    mkdir -p "$BACKUP_DIR"
    
    # 备份完整数据库
    log "备份完整数据库..."
    if pg_dump "$DATABASE_URL" > "$BACKUP_DIR/full-backup.sql"; then
        log_success "完整数据库备份创建成功"
    else
        log_error "完整数据库备份创建失败"
        exit 1
    fi
    
    # 备份结构
    log "备份数据库结构..."
    if pg_dump "$DATABASE_URL" --schema-only > "$BACKUP_DIR/schema-backup.sql"; then
        log_success "数据库结构备份创建成功"
    else
        log_warning "数据库结构备份创建失败"
    fi
    
    # 备份迁移状态
    log "备份迁移状态..."
    cd /Volumes/BankChen/wemaster/wemaster-nest
    if npx prisma migrate status > "$BACKUP_DIR/migrate-status.txt" 2>&1; then
        log_success "迁移状态备份创建成功"
    else
        log_warning "迁移状态备份创建失败"
    fi
    
    # 获取当前数据库大小和表信息
    log "收集数据库统计信息..."
    psql "$DATABASE_URL" -c "
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes
        FROM pg_stat_user_tables;
    " > "$BACKUP_DIR/table-stats.txt"
    
    psql "$DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size(current_database()));" > "$BACKUP_DIR/db-size.txt"
    
    log_success "数据库备份创建完成"
}

# 回滚迁移
rollback_migrations() {
    log "开始回滚数据库迁移..."
    
    cd /Volumes/BankChen/wemaster/wemaster-nest
    
    # 获取当前迁移状态
    log "检查当前迁移状态..."
    npx prisma migrate status
    
    # 重置数据库 (谨慎操作)
    log "重置数据库..."
    read -p "⚠️  这将删除所有数据，确认继续吗？(yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log_warning "用户取消数据库重置"
        exit 1
    fi
    
    if npx prisma migrate reset --force --skip-seed; then
        log_success "数据库重置成功"
    else
        log_error "数据库重置失败"
        exit 1
    fi
}

# 恢复数据
restore_data() {
    local backup_to_restore="$1"
    
    if [ -z "$backup_to_restore" ]; then
        log_warning "未指定备份文件，跳过数据恢复"
        return 0
    fi
    
    if [ ! -f "$backup_to_restore" ]; then
        log_error "备份文件不存在: $backup_to_restore"
        return 1
    fi
    
    log "从备份恢复数据: $backup_to_restore"
    
    # 检查备份文件完整性
    log "验证备份文件完整性..."
    if ! head -n 1 "$backup_to_restore" | grep -q "PostgreSQL database dump"; then
        log_error "备份文件格式无效"
        return 1
    fi
    
    # 恢复数据
    log "执行数据恢复..."
    if psql "$DATABASE_URL" < "$backup_to_restore"; then
        log_success "数据恢复成功"
    else
        log_error "数据恢复失败"
        return 1
    fi
    
    # 验证数据完整性
    log "验证数据完整性..."
    local table_count=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
    if [ "$table_count" -gt 0 ]; then
        log_success "数据完整性验证通过，恢复表数: $table_count"
    else
        log_error "数据完整性验证失败"
        return 1
    fi
}

# 运行种子数据
run_seeds() {
    log "运行种子数据..."
    
    cd /Volumes/BankChen/wemaster/wemaster-nest
    
    if npm run prisma:seed; then
        log_success "种子数据运行成功"
    else
        log_warning "种子数据运行失败，可能需要手动检查"
    fi
}

# 数据一致性检查
check_consistency() {
    log "执行数据一致性检查..."
    
    cd /Volumes/BankChen/wemaster/wemaster-nest
    
    # 运行一致性检查脚本
    if npm run consistency-check; then
        log_success "数据一致性检查通过"
    else
        log_warning "数据一致性检查发现问题，尝试修复..."
        
        # 尝试自动修复
        if npm run consistency-check:fix; then
            log_success "数据一致性修复成功"
        else
            log_warning "数据一致性修复失败，需要人工干预"
            return 1
        fi
    fi
}

# 性能优化
optimize_database() {
    log "执行数据库性能优化..."
    
    # 更新统计信息
    log "更新表统计信息..."
    psql "$DATABASE_URL" -c "ANALYZE;" || log_warning "统计信息更新失败"
    
    # 重建索引 (如果需要)
    log "检查索引状态..."
    local fragmented_indexes=$(psql "$DATABASE_URL" -t -c "
        SELECT schemaname, tablename, indexname 
        FROM pg_stat_user_indexes 
        WHERE idx_scan = 0 AND idx_tup_read = 0;
    ")
    
    if [ -n "$fragmented_indexes" ]; then
        log_warning "发现未使用的索引:"
        echo "$fragmented_indexes"
    fi
    
    # 清理无用数据
    log "清理无用数据..."
    psql "$DATABASE_URL" -c "VACUUM ANALYZE;" || log_warning "数据库清理失败"
    
    log_success "数据库性能优化完成"
}

# 验证回滚结果
verify_rollback() {
    log "验证数据库回滚结果..."
    
    # 检查数据库连接
    if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        log_error "数据库连接失败"
        return 1
    fi
    
    # 检查核心表是否存在
    local required_tables=("User" "Tenant" "Course" "Order" "Wallet")
    for table in "${required_tables[@]}"; do
        if ! psql "$DATABASE_URL" -c "SELECT 1 FROM \"$table\" LIMIT 1;" &> /dev/null; then
            log_error "核心表不存在: $table"
            return 1
        fi
    done
    
    # 检查数据量
    log "检查数据量..."
    local user_count=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM \"User\";")
    log "用户数量: $user_count"
    
    local course_count=$(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM \"Course\";")
    log "课程数量: $course_count"
    
    # 检查外键约束
    log "检查外键约束..."
    local constraint_check=$(psql "$DATABASE_URL" -t -c "
        SELECT count(*) 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY';
    ")
    log "外键约束数量: $constraint_check"
    
    log_success "数据库回滚验证通过"
}

# 生成回滚报告
generate_report() {
    log "生成回滚报告..."
    
    local report_file="$BACKUP_DIR/rollback-report.txt"
    
    cat > "$report_file" << EOF
WeMaster 数据库回滚报告
========================

回滚时间: $(date)
环境: $ENVIRONMENT
操作用户: $(whoami)
数据库: $(echo "$DATABASE_URL" | sed 's/.*@\(.*\):.*/\1/')

备份信息:
--------
备份目录: $BACKUP_DIR
备份文件: $BACKUP_FILE

数据库状态:
--------
数据库大小: $(cat "$BACKUP_DIR/db-size.txt" 2>/dev/null || echo "未知")
表数量: $(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
用户数量: $(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM \"User\";")
课程数量: $(psql "$DATABASE_URL" -t -c "SELECT count(*) FROM \"Course\";")

操作结果:
--------
状态: 成功
错误: 无

建议:
--------
1. 监控应用性能
2. 检查数据完整性
3. 验证业务功能
4. 更新监控告警

EOF
    
    log_success "回滚报告生成完成: $report_file"
}

# 主函数
main() {
    log "开始数据库回滚 - 环境: $ENVIRONMENT"
    
    if [ -n "$BACKUP_FILE" ]; then
        log "使用指定备份文件: $BACKUP_FILE"
    fi
    
    # 执行回滚步骤
    check_prerequisites
    create_backup
    rollback_migrations
    
    # 恢复数据 (如果指定了备份文件)
    if [ -n "$BACKUP_FILE" ]; then
        restore_data "$BACKUP_FILE"
    fi
    
    run_seeds
    check_consistency
    optimize_database
    verify_rollback
    generate_report
    
    log_success "数据库回滚完成"
    
    # 显示备份信息
    echo
    log "备份信息:"
    echo "备份目录: $BACKUP_DIR"
    echo "备份文件: $BACKUP_DIR/full-backup.sql"
    echo "回滚报告: $BACKUP_DIR/rollback-report.txt"
}

# 错误处理
trap 'log_error "数据库回滚过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"