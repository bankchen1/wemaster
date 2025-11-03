# Upstash Redis Configuration
resource "upstash_redis_database" "wemaster_redis" {
  database_name = "${var.project_name}-redis-${var.environment}"
  region        = "global"
  tls           = true
  
  # Redis 配置
  eviction = true  # 启用淘汰策略
}

# 输出 Redis 信息
output "upstash_redis_url" {
  description = "Upstash Redis connection URL"
  value       = upstash_redis_database.wemaster_redis.endpoint
}

output "upstash_redis_token" {
  description = "Upstash Redis token"
  value       = upstash_redis_database.wemaster_redis.rest_token
  sensitive   = true
}

output "upstash_redis_id" {
  description = "Upstash Redis database ID"
  value       = upstash_redis_database.wemaster_redis.database_id
}