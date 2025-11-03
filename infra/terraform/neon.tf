# Neon 数据库配置
# 注意：Neon 目前没有官方 Terraform provider，请参考 neon-setup-guide.md

# 本地值用于存储 Neon 数据库信息
locals {
  neon_project_id      = "待设置后获取"  # 在 Neon 控制台查看
  neon_branch_id       = "main"          # 默认分支
  neon_database_url    = "待设置后获取"  # 从 Neon 控制台获取连接字符串
}

# 输出数据库信息
output "neon_database_url" {
  description = "Neon database connection URL"
  value       = local.neon_database_url
  sensitive   = true
}

output "neon_project_id" {
  description = "Neon project ID"
  value       = local.neon_project_id
}

output "neon_branch_id" {
  description = "Neon branch ID"
  value       = local.neon_branch_id
}

output "neon_setup_note" {
  description = "Note about Neon setup"
  value       = "请参考 neon-setup-guide.md 手动设置 Neon 数据库"
}