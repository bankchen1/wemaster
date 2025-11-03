# Cloudflare Zone
data "cloudflare_zone" "wemaster" {
  name = var.domain_name
}

# DNS Records for Backend
# 注意：需要先部署 Fly.io 应用获取 IP 地址
# resource "cloudflare_record" "backend_api" {
#   zone_id = data.cloudflare_zone.wemaster.id
#   name    = "api"
#   value   = "待 Fly.io 部署后获取 IP"
#   type    = "A"
#   ttl     = 300
#   proxied = true
# }

# DNS Records for Admin Frontend (CNAME to Vercel)
resource "cloudflare_record" "admin_frontend" {
  zone_id = data.cloudflare_zone.wemaster.id
  name    = "admin"
  value   = "cname.vercel-dns.com"
  type    = "CNAME"
  ttl     = 300
  proxied = true
}

# DNS Records for Root Domain
resource "cloudflare_record" "root" {
  zone_id = data.cloudflare_zone.wemaster.id
  name    = "@"
  value   = "cname.vercel-dns.com"
  type    = "CNAME"
  ttl     = 300
  proxied = true
}

# Cloudflare Worker for API Gateway
data "cloudflare_api_token_permission_groups" "all" {}

resource "cloudflare_worker_script" "api_gateway" {
  account_id = var.cloudflare_account_id
  name    = "${var.project_name}-api-gateway-${var.environment}"
  content = file("${path.module}/workers/api-gateway.js")
}

# Cloudflare Worker Route
resource "cloudflare_worker_route" "api_gateway_route" {
  zone_id     = data.cloudflare_zone.wemaster.id
  pattern     = "api.${var.domain_name}/*"
  script_name = cloudflare_worker_script.api_gateway.name
}

# Cloudflare Page Rules for Caching
resource "cloudflare_page_rule" "api_cache" {
  zone_id = data.cloudflare_zone.wemaster.id
  target  = "api.${var.domain_name}/*"

  actions {
    cache_level = "cache_everything"
    edge_cache_ttl = 300
  }
}

# 输出 Cloudflare 信息
output "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  value       = data.cloudflare_zone.wemaster.id
}

output "cloudflare_nameservers" {
  description = "Cloudflare nameservers"
  value       = data.cloudflare_zone.wemaster.name_servers
}