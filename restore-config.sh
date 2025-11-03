#!/bin/bash

# 配置恢复脚本
set -e

BACKUP_DIR="./config-backups"
TIMESTAMP=${1:-}

if [ -z "$TIMESTAMP" ]; then
    echo "错误: 请提供备份时间戳"
    echo "可用备份:"
    ls -la $BACKUP_DIR/
    exit 1
fi

echo "恢复配置到时间戳: $TIMESTAMP"

# 恢复配置文件
cp $BACKUP_DIR/.env.doppler.$TIMESTAMP .env.doppler 2>/dev/null || echo "警告: .env.doppler 备份不存在"
cp $BACKUP_DIR/vercel.env.json.$TIMESTAMP vercel.env.json 2>/dev/null || echo "警告: vercel.env.json 备份不存在"
cp $BACKUP_DIR/fly.toml.$TIMESTAMP fly.toml 2>/dev/null || echo "警告: fly.toml 备份不存在"
cp $BACKUP_DIR/wrangler.toml.$TIMESTAMP wrangler.toml 2>/dev/null || echo "警告: wrangler.toml 备份不存在"

echo "配置已恢复"
echo "请重新部署服务以应用配置"