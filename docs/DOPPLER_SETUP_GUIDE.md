# Doppler 配置设置指南

## 概述

本指南详细说明如何为 WeMaster 项目设置 Doppler 配置管理和密钥注入。

## 前置条件

1. Doppler CLI 已安装
2. Doppler 账户已创建
3. 项目目录已准备

## 安装 Doppler CLI

### macOS
```bash
# 使用 Homebrew (推荐)
brew install dopplerhq/cli/doppler

# 或手动安装
curl -Ls https://cli.doppler.com/install.sh | sh
```

### 验证安装
```bash
doppler --version
# 输出: v3.75.1
```

## Doppler 项目设置

### 1. 登录 Doppler
```bash
doppler login
```

### 2. 创建项目
```bash
doppler setup
# 项目名称: wemaster
# 项目描述: WeMaster 在线教育平台
```

### 3. 创建环境
```bash
# 开发环境
doppler environments create dev

# 测试环境
doppler environments create test

# 预发布环境
doppler environments create staging

# 生产环境
doppler environments create production
```

## 环境变量配置

### 上传配置到 Doppler
```bash
# 上传测试环境配置
doppler secrets upload .env.doppler --config test

# 上传生产环境配置
doppler secrets upload .env.production --config production
```

### 管理密钥
```bash
# 查看所有密钥
doppler secrets list --config test

# 设置单个密钥
doppler secrets set DATABASE_URL "postgresql://..." --config test

# 删除密钥
doppler secrets delete OLD_SECRET --config test

# 获取单个密钥
doppler secrets get DATABASE_URL --config test
```

## 服务集成

### Vercel 集成
```bash
# 安装 Vercel CLI
npm i -g vercel

# 链接 Vercel 项目
vercel link

# 导入 Doppler 环境变量到 Vercel
doppler integrate install vercel --config test
```

### Fly.io 集成
```bash
# 安装 Fly.io CLI
curl -L https://fly.io/install.sh | sh

# 登录 Fly.io
fly auth login

# 导入环境变量
doppler secrets download --format=env --config test | fly secrets import
```

### Cloudflare Workers 集成
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 设置密钥
doppler secrets download --format=env --config test | while read line; do
  if [[ $line == *"="* ]]; then
    key=$(echo $line | cut -d'=' -f1)
    value=$(echo $line | cut -d'=' -f2-)
    wrangler secret put $key
  fi
done
```

## 自动化脚本

### 环境切换
```bash
# 切换到测试环境
./switch-env.sh test

# 切换到生产环境
./switch-env.sh production
```

### 配置备份
```bash
# 创建配置备份
./rollback-config.sh

# 恢复配置
./restore-config.sh 20241101_222700
```

### 全平台部署
```bash
# 部署测试环境
./deploy-all.sh test

# 部署生产环境
./deploy-all.sh production
```

## CI/CD 集成

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Doppler CLI
        uses: dopplerhq/cli-action@v4
        
      - name: Deploy to Vercel
        run: |
          doppler secrets download --format=env --config production > .env.production
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### Vercel 部署钩子
```bash
# 在 package.json 中添加脚本
{
  "scripts": {
    "build": "doppler run --config production -- npm run build:actual",
    "start": "doppler run --config production -- npm run start:actual"
  }
}
```

## 安全最佳实践

### 1. 服务令牌
```bash
# 生成服务令牌
doppler service-tokens create wemaster-api --config production

# 使用服务令牌
export DOPPLER_TOKEN="dp.st.prod.v1..."
doppler secrets download --config production
```

### 2. 访问控制
```bash
# 邀请团队成员
doppler users invite user@example.com --role developer

# 设置权限
doppler permissions set user@example.com --role viewer --config production
```

### 3. 审计日志
```bash
# 查看活动日志
doppler activity list

# 导出审计报告
doppler activity list --format json > audit-$(date +%Y%m%d).json
```

## 监控和告警

### 1. 密钥轮换
```bash
# 创建密钥轮换计划
doppler secrets rotate JWT_SECRET --config production

# 查看轮换状态
doppler secrets status --config production
```

### 2. 告警设置
```bash
# 设置敏感操作告警
doppler alerts create --event secret.access --type email --to admin@wemaster.com
```

## 故障排除

### 常见问题

1. **CLI 认证失败**
   ```bash
   doppler logout
   doppler login
   ```

2. **环境变量未生效**
   ```bash
   doppler secrets sync --config test
   doppler run --config test -- printenv
   ```

3. **服务集成失败**
   ```bash
   doppler integrate list
   doppler integrate uninstall vercel
   doppler integrate install vercel
   ```

### 调试命令
```bash
# 检查配置
doppler configure

# 测试连接
doppler secrets download --config test --dry-run

# 详细日志
doppler --verbose secrets list --config test
```

## 配置文件说明

### 主要配置文件

| 文件 | 用途 | 目标服务 |
|------|------|----------|
| `.env.doppler` | 环境变量配置 | 所有服务 |
| `vercel.env.json` | Vercel 前端配置 | Vercel |
| `fly.toml` | Fly.io 后端配置 | Fly.io |
| `wrangler.toml` | Cloudflare Workers 配置 | Cloudflare |
| `service-tokens.env` | 服务间令牌 | 内部服务 |

### 环境变量分类

1. **数据库配置**
   - `DATABASE_URL`
   - `REDIS_URL`

2. **认证配置**
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY`

3. **第三方服务**
   - `SENDGRID_API_KEY`
   - `TWILIO_ACCOUNT_SID`

4. **基础设施**
   - `AWS_ACCESS_KEY_ID`
   - `R2_ENDPOINT`

## 下一步

1. 完成 Doppler 项目设置
2. 上传所有环境配置
3. 配置 CI/CD 集成
4. 设置监控和告警
5. 测试完整的部署流程

## 支持

- Doppler 文档: https://docs.doppler.com
- Doppler 支持: support@doppler.com
- WeMaster 项目文档: ./docs/