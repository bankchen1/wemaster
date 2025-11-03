#!/bin/bash

# WeMaster 基础设施部署脚本
# 使用方法: ./deploy.sh [init|plan|apply|destroy]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Terraform 是否已安装
check_terraform() {
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform 未安装。请先安装 Terraform: https://developer.hashicorp.com/terraform/downloads"
        exit 1
    fi
    
    local version=$(terraform version -json | jq -r '.terraform_version')
    log_info "Terraform 版本: $version"
}

# 检查变量文件
check_variables() {
    if [ ! -f "terraform.tfvars" ]; then
        log_warning "terraform.tfvars 文件不存在"
        log_info "正在复制模板文件..."
        cp terraform.tfvars.example terraform.tfvars
        log_error "请编辑 terraform.tfvars 文件，填入实际的 API 密钥和配置"
        exit 1
    fi
    
    log_info "变量文件检查完成"
}

# 显示部署计划
show_plan() {
    log_info "显示部署计划..."
    terraform plan -var-file=terraform.tfvars
}

# 初始化 Terraform
init_terraform() {
    log_info "初始化 Terraform..."
    terraform init
    log_success "Terraform 初始化完成"
}

# 应用配置
apply_config() {
    log_info "应用 Terraform 配置..."
    log_warning "这将创建实际的云资源，可能产生费用"
    read -p "确认继续? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply -var-file=terraform.tfvars -auto-approve
        log_success "基础设施部署完成"
        
        # 显示输出
        log_info "部署结果:"
        terraform output -json | jq -r 'to_entries[] | "\(.key): \(.value.value)"'
    else
        log_info "部署已取消"
    fi
}

# 销毁资源
destroy_resources() {
    log_warning "这将删除所有创建的基础设施资源"
    log_error "包括数据库数据！此操作不可逆"
    read -p "确认销毁所有资源? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform destroy -var-file=terraform.tfvars -auto-approve
        log_success "所有资源已销毁"
    else
        log_info "销毁操作已取消"
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署状态..."
    
    # 检查健康状态
    local api_url=$(terraform output -raw application_urls | jq -r '.api_gateway')
    if [ "$api_url" != "null" ] && [ "$api_url" != "" ]; then
        log_info "检查 API 健康状态: $api_url/healthz"
        if curl -f -s "$api_url/healthz" > /dev/null; then
            log_success "API 健康检查通过"
        else
            log_warning "API 健康检查失败，可能还在启动中"
        fi
    fi
    
    # 显示访问信息
    log_info "应用访问地址:"
    terraform output application_urls | jq -r 'to_entries[] | "  \(.key): \(.value)"'
}

# 显示帮助
show_help() {
    echo "WeMaster 基础设施部署脚本"
    echo ""
    echo "使用方法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  init     - 初始化 Terraform"
    echo "  plan     - 显示部署计划"
    echo "  apply    - 部署基础设施"
    echo "  destroy  - 销毁所有资源"
    echo "  verify   - 验证部署状态"
    echo "  help     - 显示此帮助信息"
    echo ""
    echo "完整部署流程:"
    echo "  1. $0 init"
    echo "  2. 编辑 terraform.tfvars 文件"
    echo "  3. $0 plan"
    echo "  4. $0 apply"
    echo "  5. $0 verify"
}

# 主函数
main() {
    cd "$(dirname "$0")"
    
    case "${1:-help}" in
        "init")
            check_terraform
            init_terraform
            ;;
        "plan")
            check_terraform
            check_variables
            show_plan
            ;;
        "apply")
            check_terraform
            check_variables
            apply_config
            ;;
        "destroy")
            check_terraform
            check_variables
            destroy_resources
            ;;
        "verify")
            check_terraform
            verify_deployment
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 运行主函数
main "$@"