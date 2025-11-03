variable "vercel_api_token" {
  type        = string
  description = "Vercel API token for frontend deployment"
  sensitive   = true
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token for DNS and workers"
  sensitive   = true
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID"
  sensitive   = true
}

variable "fly_api_token" {
  type        = string
  description = "Fly.io API token for backend deployment"
  sensitive   = true
}

variable "neon_api_key" {
  type        = string
  description = "Neon database API key"
  sensitive   = true
}

variable "upstash_email" {
  type        = string
  description = "Upstash email for Redis"
  sensitive   = true
}

variable "upstash_api_key" {
  type        = string
  description = "Upstash API key for Redis"
  sensitive   = true
}

variable "aws_access_key" {
  type        = string
  description = "AWS access key for R2 storage"
  sensitive   = true
}

variable "aws_secret_key" {
  type        = string
  description = "AWS secret key for R2 storage"
  sensitive   = true
}

variable "doppler_token" {
  type        = string
  description = "Doppler API token for secrets management"
  sensitive   = true
}

variable "project_name" {
  type        = string
  description = "Project name for resource naming"
  default     = "wemaster"
}

variable "environment" {
  type        = string
  description = "Environment (dev, staging, prod)"
  default     = "dev"
}

variable "domain_name" {
  type        = string
  description = "Main domain name"
  default     = "wemaster.dev"
}