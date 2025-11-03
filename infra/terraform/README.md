# WeMaster 基础设施 Terraform 配置

这个目录包含了 WeMaster 平台的完整 Terraform 基础设施配置。

## 架构概览

### 服务提供商
- **前端**: Vercel (管理后台)
- **后端**: Fly.io (NestJS API)
- **数据库**: Neon (PostgreSQL)
- **缓存**: Upstash Redis
- **存储**: AWS R2 (S3 兼容)
- **DNS/CDN**: Cloudflare
- **密钥管理**: Doppler

## 快速开始

### 1. 环境准备

确保你已经安装了以下工具：
- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5.0
- 各服务的账户和 API 密钥

### 2. 配置变量

复制变量模板并填入实际的 API 密钥：

```bash
cp terraform.tfvars.example terraform.tfvars
```

编辑 `terraform.tfvars` 文件，填入以下信息：

#### Vercel
- 访问 https://vercel.com/account/tokens 获取 API token

#### Cloudflare
- 访问 https://dash.cloudflare.com/profile/api-tokens 获取 API token
- 需要权限：Zone:Zone:Read, Zone:DNS:Edit, Zone:Page Rules:Edit, Account:Cloudflare Pages:Edit

#### Fly.io
- 安装 Fly CLI: `curl -L https://fly.io/install.sh | sh`
- 登录: `fly auth login`
- 获取 token: `fly auth token`

#### Neon
- 访问 https://neon.tech/docs/manage/api-keys 获取 API key

#### Upstash
- 访问 https://console.upstash.com/login 注册/登录
- 获取 Email 和 API key

#### AWS
- 访问 https://console.aws.amazon.com/iam/ 创建访问密钥
- 需要适当的 R2 权限

#### Doppler
- 访问 https://console.doppler.com/workplace/user-settings/access-tokens 获取 API token

### 3. 初始化 Terraform

```bash
terraform init
```

### 4. 查看执行计划

```bash
terraform plan
```

### 5. 部署基础设施

```bash
terraform apply
```

## 目录结构

```
.
├── main.tf              # 主配置文件
├── variables.tf         # 变量定义
├── outputs.tf           # 输出定义
├── terraform.tfvars.example  # 变量模板
├── vercel.tf            # Vercel 配置
├── neon.tf              # Neon 数据库配置
├── upstash.tf           # Upstash Redis 配置
├── fly.tf               # Fly.io 后端配置
├── cloudflare.tf        # Cloudflare DNS/Workers 配置
├── aws.tf               # AWS R2 存储配置
├── doppler.tf           # Doppler 密钥管理配置
├── workers/
│   └── api-gateway.js   # Cloudflare Worker 脚本
├── .gitignore           # Git 忽略文件
└── README.md            # 本文件
```

## 验证部署

部署完成后，可以通过以下方式验证：

### 1. 检查健康状态
```bash
curl https://api.wemaster.dev/healthz
```

### 2. 检查前端
访问 https://admin.wemaster.dev

### 3. 检查数据库连接
使用输出的数据库 URL 测试连接

### 4. 检查 Redis 连接
使用输出的 Redis URL 测试连接

## 环境变量注入

所有敏感配置都通过 Doppler 管理。部署后：

1. 在 Doppler 控制台中查看项目
2. 配置额外的环境变量
3. 在应用中使用 Doppler SDK 或 CLI 注入环境变量

## 成本估算

以下是月度成本估算（基于使用量）：

- **Vercel**: $0-20/月 (基于用量)
- **Fly.io**: $5-30/月 (基于使用量)
- **Neon**: $0-25/月 (基于数据库使用)
- **Upstash Redis**: $0-15/月 (基于请求量)
- **AWS R2**: $0-10/月 (基于存储和请求)
- **Cloudflare**: $0/月 (免费计划)
- **Doppler**: $0/月 (免费计划)

## 故障排除

### 常见问题

1. **Terraform 初始化失败**
   - 检查网络连接
   - 确认 Terraform 版本

2. **Provider 认证失败**
   - 验证 API 密钥是否正确
   - 检查密钥权限

3. **资源创建失败**
   - 检查账户余额
   - 验证资源配额

4. **DNS 传播延迟**
   - DNS 更新可能需要几分钟到几小时
   - 使用 `dig` 或 `nslookup` 检查 DNS 状态

### 日志查看

```bash
# 查看特定资源状态
terraform state show <resource_name>

# 查看部署历史
terraform plan -detailed-exitcode

# 刷新状态
terraform refresh
```

## 销毁资源

如果需要销毁所有创建的资源：

```bash
terraform destroy
```

**警告：这将删除所有基础设施资源，包括数据库数据！**

## 生产环境部署

对于生产环境：

1. 修改 `terraform.tfvars` 中的 `environment` 为 "prod"
2. 使用更强的密码和密钥
3. 启用所有服务的监控和日志
4. 配置备份策略
5. 设置适当的预算和告警

## 支持

如果遇到问题，请检查：
1. 各服务的状态页面
2. Terraform 日志
3. 服务提供商的文档

## 安全注意事项

- 永远不要提交包含敏感信息的 `terraform.tfvars` 文件
- 定期轮换 API 密钥
- 使用最小权限原则
- 启用所有服务的 2FA
- 定期审查访问权限