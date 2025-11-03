# Doppler Project
resource "doppler_project" "wemaster" {
  name = var.project_name
  description = "WeMaster Platform Configuration"
}

# Doppler Environments
resource "doppler_environment" "dev" {
  project = doppler_project.wemaster.name
  name    = "dev"
  slug    = "dev"
}

resource "doppler_environment" "staging" {
  project = doppler_project.wemaster.name
  name    = "staging"
  slug    = "staging"
}

resource "doppler_environment" "prod" {
  project = doppler_project.wemaster.name
  name    = "prod"
  slug    = "prod"
}

# Doppler Secrets for Development Environment
# DATABASE_URL 将在 Neon 设置后手动配置
# resource "doppler_secret" "dev_database_url" {
#   project = doppler_project.wemaster.name
#   config  = doppler_environment.dev.slug
#   name    = "DATABASE_URL"
#   value   = "请从 Neon 控制台获取连接字符串"
# }

resource "doppler_secret" "dev_redis_url" {
  project = doppler_project.wemaster.name
  config  = doppler_environment.dev.slug
  name    = "REDIS_URL"
  value   = upstash_redis_database.wemaster_redis.endpoint
}

resource "doppler_secret" "dev_redis_token" {
  project = doppler_project.wemaster.name
  config  = doppler_environment.dev.slug
  name    = "REDIS_TOKEN"
  value   = upstash_redis_database.wemaster_redis.rest_token
}

resource "doppler_secret" "dev_jwt_secret" {
  project = doppler_project.wemaster.name
  config  = doppler_environment.dev.slug
  name    = "JWT_SECRET"
  value   = random_password.jwt_secret.result
}

resource "doppler_secret" "dev_aws_access_key" {
  project = doppler_project.wemaster.name
  config  = doppler_environment.dev.slug
  name    = "AWS_ACCESS_KEY"
  value   = var.aws_access_key
}

resource "doppler_secret" "dev_aws_secret_key" {
  project = doppler_project.wemaster.name
  config  = doppler_environment.dev.slug
  name    = "AWS_SECRET_KEY"
  value   = var.aws_secret_key
}

resource "doppler_secret" "dev_s3_bucket" {
  project = doppler_project.wemaster.name
  config  = doppler_environment.dev.slug
  name    = "S3_BUCKET"
  value   = aws_s3_bucket.wemaster_storage.id
}

# 生成 JWT Secret
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

# Doppler Service Token for Development
resource "doppler_service_token" "dev_token" {
  project = doppler_project.wemaster.name
  config  = doppler_environment.dev.slug
  name    = "dev-service-token"
  access  = "read"
  # ttl 参数在某些版本中不支持，如需要可以在 Doppler 控制台设置
}

# 输出 Doppler 信息
output "doppler_project_name" {
  description = "Doppler project name"
  value       = doppler_project.wemaster.name
}

output "doppler_dev_service_token" {
  description = "Doppler service token for dev environment"
  value       = doppler_service_token.dev_token.key
  sensitive   = true
}