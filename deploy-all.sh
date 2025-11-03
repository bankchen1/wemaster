#!/bin/bash

# 全平台部署脚本
set -e

echo "开始部署 WeMaster 全平台..."

# 加载环境变量
source ./switch-env.sh ${1:-test}

# 部署前端到 Vercel
echo "部署前端到 Vercel..."
cd wemaster-admin
npm run build
vercel --prod
cd ..

# 部署后端到 Fly.io
echo "部署后端到 Fly.io..."
cd wemaster-nest
fly deploy
cd ..

# 部署 Workers 到 Cloudflare
echo "部署 Workers 到 Cloudflare..."
cd wemaster-workers
wrangler deploy
cd ..

echo "全平台部署完成!"