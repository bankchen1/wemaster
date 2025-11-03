# Neon 数据库设置指南

由于 Neon 目前没有官方的 Terraform provider，需要手动配置数据库。

## 1. 注册 Neon 账户

访问 https://neon.tech 注册账户

## 2. 创建项目

1. 登录 Neon 控制台
2. 点击 "New Project"
3. 输入项目名称：`wemaster-db-dev`
4. 选择区域：`AWS - US East 1 (N. Virginia)`
5. 选择 PostgreSQL 版本：`15`
6. 点击 "Create Project"

## 3. 创建数据库

项目创建后，默认会创建一个名为 `neondb` 的数据库。可以重命名或创建新的数据库：

```sql
-- 在 Neon 控制台的 SQL Editor 中执行
CREATE DATABASE wemaster;
```

## 4. 创建用户

```sql
CREATE USER wemaster_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wemaster TO wemaster_user;
```

## 5. 获取连接信息

在 Neon 控制台中：
1. 进入项目详情
2. 点击 "Connection Details"
3. 复制连接字符串，格式如下：
   ```
   postgresql://wemaster_user:your_secure_password@ep-xxx.us-east-1.aws.neon.tech:5432/wemaster?sslmode=require
   ```

## 6. 配置环境变量

将连接字符串添加到 Doppler 或直接配置到应用：

```bash
DATABASE_URL="postgresql://wemaster_user:your_secure_password@ep-xxx.us-east-1.aws.neon.tech:5432/wemaster?sslmode=require"
```

## 7. 运行数据库迁移

在 `wemaster-nest` 目录中：

```bash
# 设置数据库 URL
export DATABASE_URL="your_neon_connection_string"

# 运行迁移
npm run prisma:migrate

# 生成 Prisma 客户端
npm run prisma:generate

# 填充种子数据
npm run prisma:seed
```

## 8. 验证连接

```bash
# 测试数据库连接
npm run prisma:db:push
```

## 输出信息

记录以下信息用于 Terraform outputs：
- 项目 ID：在 Neon 控制台 URL 中查看
- 数据库 URL：完整的连接字符串
- 分支 ID：通常是 `main`

## 注意事项

1. Neon 的免费层有连接数限制
2. 自动休眠功能可能导致首次连接较慢
3. 定期备份数据库
4. 监控数据库使用量