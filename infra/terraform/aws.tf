# AWS S3 Bucket for R2 Storage
resource "aws_s3_bucket" "wemaster_storage" {
  bucket = "${var.project_name}-storage-${var.environment}"
}

# S3 Bucket Configuration
resource "aws_s3_bucket_versioning" "wemaster_storage_versioning" {
  bucket = aws_s3_bucket.wemaster_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "wemaster_storage_encryption" {
  bucket = aws_s3_bucket.wemaster_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "wemaster_storage_pab" {
  bucket = aws_s3_bucket.wemaster_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS Configuration for S3 Bucket
resource "aws_s3_bucket_cors_configuration" "wemaster_storage_cors" {
  bucket = aws_s3_bucket.wemaster_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "OPTIONS"]
    allowed_origins = ["https://admin.wemaster.dev", "https://wemaster.dev"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# 输出 S3 信息
output "s3_bucket_name" {
  description = "S3 bucket name for storage"
  value       = aws_s3_bucket.wemaster_storage.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.wemaster_storage.arn
}