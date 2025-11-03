# 综合输出信息

# 应用 URLs
output "application_urls" {
  description = "All application URLs"
  value = {
    admin_frontend = "https://admin.${var.domain_name}"
    api_gateway    = "https://api.${var.domain_name}"
    backend_direct = "https://${local.fly_backend_hostname}"
  }
}

# 数据库连接信息
output "database_config" {
  description = "Database configuration"
  value = {
    url        = local.neon_database_url
    project_id = local.neon_project_id
    branch_id  = local.neon_branch_id
  }
  sensitive = true
}

# Redis 连接信息
output "redis_config" {
  description = "Redis configuration"
  value = {
    url   = upstash_redis_database.wemaster_redis.endpoint
    token = upstash_redis_database.wemaster_redis.rest_token
  }
  sensitive = true
}

# 存储配置
output "storage_config" {
  description = "Storage configuration"
  value = {
    bucket_name = aws_s3_bucket.wemaster_storage.id
    bucket_arn  = aws_s3_bucket.wemaster_storage.arn
  }
}

# DNS 配置
output "dns_config" {
  description = "DNS configuration"
  value = {
    zone_id      = data.cloudflare_zone.wemaster.id
    nameservers  = data.cloudflare_zone.wemaster.name_servers
    api_record   = "待 Fly.io 部署后配置"
    admin_record = cloudflare_record.admin_frontend.hostname
  }
}

# 部署清单
output "deployment_summary" {
  description = "Deployment summary"
  value = {
    project_name = var.project_name
    environment  = var.environment
    domain_name  = var.domain_name
    deployed_at  = timestamp()
    services = {
      frontend = "Vercel"
      backend  = "Fly.io"
      database = "Neon"
      cache    = "Upstash Redis"
      storage  = "AWS R2"
      dns      = "Cloudflare"
      secrets  = "Doppler"
    }
  }
}