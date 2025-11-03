# Fly.io 后端部署配置
# 注意：Fly.io 目前没有官方 Terraform provider，请参考 fly-deployment-guide.md

# 本地值用于存储 Fly.io 部署信息
locals {
  fly_backend_hostname = "wemaster-backend-dev.fly.dev"
  fly_backend_app_id   = "wemaster-backend-dev"
  fly_backend_ipv4     = "待部署后获取"  # 通过 `fly ips list` 获取
  fly_backend_ipv6     = "待部署后获取"  # 通过 `fly ips list` 获取
}

# 输出 Fly.io 信息
output "fly_backend_hostname" {
  description = "Fly.io backend hostname"
  value       = local.fly_backend_hostname
}

output "fly_backend_app_id" {
  description = "Fly.io app ID"
  value       = local.fly_backend_app_id
}

output "fly_backend_ipv4" {
  description = "Fly.io backend IPv4 address"
  value       = local.fly_backend_ipv4
}

output "fly_backend_ipv6" {
  description = "Fly.io backend IPv6 address"
  value       = local.fly_backend_ipv6
}

output "fly_deployment_note" {
  description = "Note about Fly.io deployment"
  value       = "请参考 fly-deployment-guide.md 手动部署 Fly.io 应用"
}