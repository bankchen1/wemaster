# 开发指南

## 项目设置

1. **安装依赖**
```bash
npm install
```

2. **设置环境变量**
复制 `.env.example` 到 `.env` 并填写以下变量：
```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/wemaster

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# LiveKit
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_API_URL=https://your-livekit-server

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Redis
REDIS_URL=redis://localhost:6379
```

3. **数据库迁移**
```bash
npx prisma migrate dev
```

4. **启动开发服务器**
```bash
npm run dev
```

## 代码规范

### TypeScript 配置
项目使用严格模式的 TypeScript 配置：
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### ESLint 规则
使用 `@nestjs/eslint-config` 作为基础配置，并添加以下自定义规则：
```json
{
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal"],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc",
        "caseInsensitive": true
      }
    }]
  }
}
```

### Git 提交规范
使用 Angular 提交规范：
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

## 模块开发指南

### 创建新模块
```bash
nest g module my-module
nest g controller my-module
nest g service my-module
```

### 模块结构
```
my-module/
├── dto/                 # 数据传输对象
├── entities/           # 数据库实体
├── interfaces/         # 接口定义
├── my-module.controller.ts
├── my-module.service.ts
├── my-module.module.ts
└── tests/             # 测试文件
```

### 依赖注入
使用构造器注入依赖：
```typescript
@Injectable()
export class MyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}
}
```

### 异常处理
使用 NestJS 内置的异常过滤器：
```typescript
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid token');
throw new ForbiddenException('Access denied');
throw new NotFoundException('Resource not found');
```

### 日志记录
使用自定义的 LoggerService：
```typescript
this.logger.log('MyService', 'Processing request', {
  userId: user.id,
  action: 'create',
});

this.logger.error('MyService', 'Failed to process request', {
  error,
  userId: user.id,
});
```

## 测试指南

### 单元测试
使用 Jest 进行单元测试：
```typescript
describe('MyService', () => {
  let service: MyService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### 集成测试
使用 `@nestjs/testing` 进行集成测试：
```typescript
describe('MyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/GET my-endpoint', () => {
    return request(app.getHttpServer())
      .get('/my-endpoint')
      .expect(200);
  });
});
```

## 部署指南

### 构建
```bash
npm run build
```

### 生产环境配置
1. 设置生产环境变量
2. 运行数据库迁移
3. 启动应用
```bash
npm run start:prod
```

### 监控
使用 PM2 进行进程管理：
```bash
pm2 start dist/main.js --name wemaster-api
```

### 日志
生产环境日志配置：
```typescript
const logger = new Logger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json(),
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});
```

## 性能优化

### 缓存策略
使用 Redis 缓存：
```typescript
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl);
  }
}
```

### 数据库优化
1. 使用适当的索引
2. 优化查询
3. 使用连接池
4. 定期维护

### WebSocket 优化
1. 使用适当的心跳间隔
2. 实现重连机制
3. 消息压缩
4. 限制并发连接数
