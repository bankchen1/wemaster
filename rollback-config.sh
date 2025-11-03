#!/bin/bash

# 配置回滚脚本
set -e

BACKUP_DIR="./config-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "创建配置备份..."

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份当前配置
cp .env.doppler $BACKUP_DIR/.env.doppler.$TIMESTAMP 2>/dev/null || true
cp vercel.env.json $BACKUP_DIR/vercel.env.json.$TIMESTAMP 2>/dev/null || true
cp fly.toml $BACKUP_DIR/fly.toml.$TIMESTAMP 2>/dev/null || true
cp wrangler.toml $BACKUP_DIR/wrangler.toml.$TIMESTAMP 2>/dev/null || true

echo "配置已备份到: $BACKUP_DIR"

# 列出可用的备份
echo "可用的备份:"
ls -la $BACKUP_DIR/

echo "使用方法: ./restore-config.sh <timestamp>"