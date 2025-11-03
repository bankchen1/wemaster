# Vercel Project Configuration
resource "vercel_project" "wemaster_admin" {
  name      = "${var.project_name}-admin-${var.environment}"
  framework = "vite"

  build_command = "npm run build"
  output_directory = "dist"

  # 环境变量将通过 Doppler 注入
  environment = []

  # Git 集成
  git_repository = {
    provider = "github"
    repo = "wemaster/wemaster-admin"
    type = "github"
  }
}

# Vercel Project Alias (需要在部署后手动配置)
# resource "vercel_alias" "wemaster_admin_alias" {
#   deployment_id = "待部署后获取"
#   alias      = "admin.${var.domain_name}"
# }



# 输出 Vercel 信息
output "vercel_admin_url" {
  description = "Admin frontend URL"
  value       = "https://admin.${var.domain_name}"
}

output "vercel_admin_project_id" {
  description = "Vercel project ID for admin"
  value       = vercel_project.wemaster_admin.id
}