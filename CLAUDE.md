# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WeMaster Platform** - A comprehensive multi-tenant educational platform connecting students with expert tutors for personalized 1-on-1 sessions, interactive courses, and flexible learning paths.

**Tech Stack**:
- Backend: NestJS + Prisma (PostgreSQL) + Redis + Stripe
- Admin Frontend: Vue 3 + Vite + Element Plus
- Core Frontend: Next.js 15 (App Router)
- Mobile: Flutter + Dart
- Monitoring: OpenTelemetry + Prometheus + Grafana + Sentry

**Project Status**: 85-90% complete, production-ready architecture

---

## Repository Structure

```
wemaster/
├── wemaster-nest/          # NestJS backend API (port 3001)
├── wemaster-admin/         # Vue 3 admin dashboard
├── wemaster-core/          # Next.js student/tutor portal
├── wemaster-app-flutter/   # Flutter mobile app
├── scripts/                # Automation and deployment scripts
├── docs/                   # Project documentation
├── infra/                  # Infrastructure configs (monitoring, observability)
├── performance-tests/      # Load testing and benchmarks
└── logs/                   # Execution logs
```

---

## Common Commands

### Backend (wemaster-nest)

```bash
cd wemaster-nest

# Development
npm run start:dev           # Start with hot-reload (port 3001)
npm run build              # Compile TypeScript to dist/
npm run start:prod         # Run production build

# Database
npm run prisma:generate    # Generate Prisma client after schema changes
npm run prisma:migrate     # Create and apply database migration
npm run prisma:seed        # Seed database with demo data
npm run prisma:studio      # Open Prisma Studio GUI

# Testing
npm run test               # Run unit tests
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run end-to-end tests
npm run test:watch        # Watch mode for development

# Code Quality
npm run lint              # Lint and auto-fix code
npm run format            # Format with Prettier

# API Documentation
npm run swagger:export     # Export OpenAPI spec
npm run contract:diff      # Validate contract drift
```

### Admin Frontend (wemaster-admin)

```bash
cd wemaster-admin

# Development
npm run dev                # Start Vite dev server
npm run build             # Build for production
npm run preview           # Preview production build

# Code Generation
npm run api:generate      # Generate API client from OpenAPI spec (Orval)
```

### Core Frontend (wemaster-core)

```bash
cd wemaster-core

# Development
npm run dev               # Start Next.js dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server

# Database (uses Prisma)
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes (no migrations)
npm run db:migrate       # Create and apply migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# API Integration
npm run api:generate     # Generate TypeScript SDK from OpenAPI (Orval)

# Testing
npm run test:e2e         # Playwright E2E tests
npm run test:payment     # Test Stripe payment flow
```

### Mobile App (wemaster-app-flutter)

```bash
cd wemaster-app-flutter

flutter pub get          # Install dependencies
flutter run             # Run on connected device
flutter build apk       # Build Android APK
flutter build ios       # Build iOS app
flutter test            # Run unit tests
flutter analyze         # Code analysis
```

### Project-Level Scripts

```bash
# Deployment
./deploy-staging.sh      # Deploy to staging environment
./deploy-all.sh          # Deploy all services
./switch-env.sh          # Switch between environments

# Monitoring & Logs
./scripts/log-control.sh # Control log verbosity
./scripts/m6-*.sh        # M6 milestone test scripts

# Rollback
./rollback-config.sh     # Rollback configuration changes
./scripts/rollback-staging.sh # Rollback staging deployment
```

---

## Architecture Highlights

### Multi-Tenant Design

**Critical**: All database queries MUST include `tenantId` filter for data isolation.

**Tenant Resolution**:
- Via subdomain: `acme.wemaster.com` → tenant `acme`
- Via custom domain: `acme-edu.com` → lookup in Tenant table
- Via header: `x-tenant-id` (for API calls)

**Implementation Pattern**:
```typescript
// Backend (NestJS)
const tenant = this.tenantContext.getTenantOrThrow();
const data = await prisma.offering.findMany({
  where: {
    tenantId: tenant.id,  // ← Always filter by tenant!
    isPublished: true,
  },
});

// Frontend (Next.js)
import { getTenantContext } from '@/lib/tenant';
const { tenantId } = await getTenantContext();
```

### Contract-First API Development

**Source of Truth**: OpenAPI specification at `/Volumes/BankChen/project-desgin/wemaster2/docs/api/`

**Workflow**:
1. Define API contracts in `openapi.yaml` and `.md` files
2. Backend implements controllers matching contract exactly
3. Frontend auto-generates SDK via Orval: `npm run api:generate`
4. Frontend uses type-safe SDK (no hand-written API calls)

**Three-Stage Review Process**:
1. Frontend self-review
2. Backend self-review
3. GPT review

**Contract Status Progression**: DRAFT → REVIEW → APPROVED

### Frontend-Backend Separation (CRITICAL)

**Strict Rules** (from ARCHITECTURE_RULES.md):

**Frontend (wemaster-core) MUST NOT**:
- ❌ Import Prisma Client
- ❌ Perform business logic (password hashing, email sending, etc.)
- ❌ Call third-party APIs directly (Stripe, Aliyun, etc.)
- ❌ Generate/verify JWT tokens
- ❌ Access sensitive environment variables (except `NEXT_PUBLIC_*`)

**Frontend CAN ONLY**:
- ✅ Render UI (React components)
- ✅ Call backend API (via Orval-generated SDK)
- ✅ Manage client state (Zustand, Redux)
- ✅ Handle routing and navigation

**Backend (wemaster-nest) MUST Handle**:
- ✅ All business logic
- ✅ All database operations
- ✅ Email sending
- ✅ Payment processing
- ✅ Third-party API integrations

**Data Flow**:
```
Frontend (UI + API calls)
    ↓ HTTP Request
Backend (Business Logic + Database)
    ↓ Database Query
PostgreSQL
```

### Backend Module Structure

```
wemaster-nest/src/
├── main.ts                    # Application entry + global config
├── app.module.ts              # Root module
├── core/                      # Core infrastructure
│   ├── auth/                 # JWT authentication + Passport
│   ├── tenant/               # Multi-tenant middleware + context
│   ├── rbac/                 # Role-based access control
│   └── idempotency/          # Idempotency interceptor
├── modules/                   # Business domain modules
│   ├── offerings/            # Course management
│   ├── orders/               # Order processing
│   ├── payments/             # Stripe integration
│   ├── sessions/             # Session scheduling
│   ├── wallet/               # Student wallet
│   ├── tutor/                # Tutor dashboard
│   ├── student/              # Student dashboard
│   └── admin/                # Admin panel
├── infra/                     # External service integrations
│   ├── prisma/               # Database service
│   ├── redis/                # Cache service
│   ├── stripe/               # Payment service
│   └── email/                # Email service (Aliyun)
└── common/                    # Shared utilities
    ├── decorators/           # @Roles(), @Public(), @User()
    ├── filters/              # Exception filters
    └── guards/               # Auth and role guards
```

### Frontend Architecture (wemaster-core)

**API Integration Pattern**:
```
OpenAPI Spec (from backend)
    ↓ (Orval generates)
lib/api/generated/**  (Type-safe SDK + React Query hooks)
    ↓ (wrapped by)
lib/api/compat/**  (Thin compatibility layer)
    ↓ (used by)
Pages (app/**/page.tsx)
```

**Example Usage**:
```typescript
// Server Component (data fetching)
import { adminApi } from '@/lib/api/compat/admin';

export default async function DashboardPage() {
  const metrics = await adminApi.getDashboardMetrics();
  return <DashboardClient metrics={metrics} />;
}

// Client Component (interactivity)
'use client';
export function DashboardClient({ metrics }) {
  const [filter, setFilter] = useState('all');
  return <div>{/* UI */}</div>;
}
```

**Unified API Client** (`lib/api/api-client.ts`):
- Sets base URL from `NEXT_PUBLIC_API_URL`
- Injects `Authorization: Bearer <token>` header
- Injects `x-tenant-id` header
- Generates `Idempotency-Key` for mutations
- Handles errors uniformly

### Database Schema (Prisma)

**Key Models** (30+ total):
- `Tenant` - Multi-tenant isolation
- `User` - Base accounts with role (STUDENT/TUTOR/ADMIN)
- `TutorProfile/StudentProfile/AdminProfile` - Role-specific data
- `Offering` - Courses (4 types: RECORDED, LIVE_1ON1, GROUP, TRIAL)
- `OfferingVariant` - Pricing tiers
- `Session` - Scheduled classes
- `Order` - Purchase orders
- `Payment` - Payment records (Stripe)
- `Enrollment` - Course access
- `Review` - Course reviews
- `Wallet/WalletTransaction` - Student wallet
- `TutorEarning` - Tutor earnings tracking
- `VipSubscription` - VIP membership
- `WebhookEvent` - Webhook idempotency
- `AuditLog` - Audit trail

**Schema Change Workflow**:
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
cd wemaster-nest && npm run prisma:migrate
# 3. Generate client
npm run prisma:generate
# 4. Update seed data if needed
npm run prisma:seed
```

---

## Key Implementation Patterns

### Idempotency

**Required for**:
- Order creation
- Payment processing
- Booking/scheduling
- Refunds

**Implementation**:
```typescript
// Backend controller
@UseInterceptors(IdempotencyInterceptor)
@Post('draft')
async createDraftOrder(@Body() dto: CreateOrderDto) {
  // Redis key: idempotency:{key} (24h TTL)
  // Cached response returned if key exists
}

// Frontend API call
await api.createOrder(dto, {
  headers: {
    'Idempotency-Key': generateIdempotencyKey()
  }
});
```

### Webhook Handling (Stripe)

**Pattern**:
1. Check `WebhookEvent.findUnique({ eventId })` - return if processed
2. Create `WebhookEvent` record (processed: false)
3. Process event in try-catch
4. Mark processed: true, processedAt: new Date()
5. On error: log in `WebhookEvent.error` field

### RBAC (Role-Based Access Control)

```typescript
// Backend controller
@Roles('TUTOR')  // Requires TUTOR role
@UseGuards(JwtAuthGuard, RolesGuard)
async createOffering() { /* ... */ }

// Public endpoint (bypasses auth)
@Public()
@Get('offerings/:slug')
async getPublicOffering() { /* ... */ }
```

### Response Format

**Success** (auto-wrapped by interceptor):
```json
{
  "success": true,
  "data": { /* ... */ },
  "meta": { "timestamp": "...", "version": "v1" }
}
```

**Error** (handled by exception filter):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { /* ... */ }
  }
}
```

---

## Environment Configuration

### Backend (.env)

```bash
# Required
NODE_ENV=development|staging|production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/wemaster
REDIS_URL=redis://localhost:6379
JWT_SECRET=<strong-secret>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Aliyun)
ALIYUN_EMAIL_APP_ID=...
ALIYUN_EMAIL_SECRET=...

# Optional
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
SENTRY_DSN=...
```

### Frontend (.env.local)

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Auth (Stack Auth or custom)
STACK_AUTH_PROJECT_ID=...
NEXT_PUBLIC_STACK_AUTH_PUBLISHABLE_KEY=...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional
NEXT_PUBLIC_SENTRY_DSN=...
```

### Environment Management

**Doppler Integration** (recommended):
```bash
# Install Doppler CLI
curl -Ls https://cli.doppler.com/install.sh | sh

# Login
doppler login

# Setup project
doppler setup

# Run with Doppler
doppler run -- npm run start:dev
```

**Manual Environment Switching**:
```bash
# Switch to staging
./switch-env.sh staging

# Switch to production
./switch-env.sh production
```

---

## Testing Guidelines

### Backend Testing

**Unit Tests**:
- Place `*.spec.ts` beside implementation files
- Mock external dependencies (Stripe, Redis, Email)
- Target: 80%+ coverage for business logic

**E2E Tests**:
- Place in `test/*.e2e-spec.ts`
- Use real database connections
- Test critical flows (auth, payment, booking)

**Example**:
```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();
    service = module.get(UserService);
  });

  it('should create user', async () => {
    const user = await service.create({ email: 'test@example.com' });
    expect(user.email).toBe('test@example.com');
  });
});
```

### Frontend Testing (Playwright)

```bash
cd wemaster-core
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive UI mode
npm run test:e2e:headed   # Headed mode (visible browser)
```

### Performance Testing

```bash
cd performance-tests
npm run load-test         # Load testing
npm run stress-test       # Stress testing
npm run spike-test        # Spike testing
```

---

## Deployment

### Staging Deployment

```bash
# Full staging deployment
./deploy-staging.sh

# Verify deployment
curl https://staging-api.wemaster.com/healthz
```

### Production Deployment

```bash
# Deploy all services
./deploy-all.sh

# Verify production
curl https://api.wemaster.com/healthz
```

### Rollback

```bash
# Rollback staging
./scripts/rollback-staging.sh

# Rollback config only
./rollback-config.sh
```

### Pre-Deployment Checklist

**Backend**:
- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run test` - all tests pass
- [ ] Run `npm run prisma:migrate:deploy` - apply migrations
- [ ] Verify Stripe webhook endpoint configured
- [ ] Check CORS origins match frontend domains
- [ ] Test health check: `/healthz`

**Frontend**:
- [ ] Run `npm run build` - successful build
- [ ] Run `npm run test:e2e` - E2E tests pass
- [ ] Verify `NEXT_PUBLIC_API_URL` points to correct backend
- [ ] Test authentication flow
- [ ] Verify Stripe publishable key is correct

---

## Monitoring & Observability

### Stack

- **Metrics**: Prometheus + Grafana
- **Traces**: OpenTelemetry + Jaeger
- **Logs**: Pino (backend) + Sentry (errors)
- **Health Checks**: `/healthz` endpoints

### Starting Observability Stack

```bash
# Start monitoring services
docker-compose -f docker-compose.observability.yml up -d

# Access dashboards
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
# Jaeger: http://localhost:16686
```

### Log Control

```bash
# Set log level
./scripts/log-control.sh set info|debug|error

# Get current log level
./scripts/log-control.sh get
```

---

## Security Best Practices

### Authentication
- ✅ JWT with access (1h) + refresh (30d) tokens
- ✅ bcrypt password hashing (10 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Multi-factor authentication support

### Input Validation
- ✅ class-validator on all DTOs
- ✅ Zod schemas on frontend
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (Helmet)
- ✅ CSRF tokens

### API Security
- ✅ Rate limiting (configurable per endpoint)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Idempotency for mutations
- ✅ Webhook signature verification

### Data Security
- ✅ Tenant isolation enforced
- ✅ Audit logs for critical operations
- ✅ Encryption at rest (PostgreSQL)
- ✅ TLS/SSL for all communications

---

## Troubleshooting

### Backend Won't Start

```bash
# Clean and rebuild
cd wemaster-nest
rm -rf dist node_modules
npm install
npm run build
npm run start:dev

# Kill stale processes
pkill -f "nest start"
```

### Frontend Build Fails

```bash
# Clean Next.js cache
cd wemaster-core
rm -rf .next node_modules
npm install
npm run dev
```

### Database Issues

```bash
# Reset database (DESTRUCTIVE)
npm run db:reset

# Fix migration issues
npm run prisma:migrate:resolve

# Regenerate Prisma client
npm run prisma:generate
```

### API Returns 401 Unauthorized

- Check `NEXT_PUBLIC_API_URL` is correct
- Verify auth token is being sent
- Check `x-tenant-id` header is present
- Verify JWT_SECRET matches between frontend/backend

### Module Not Found After Adding New Endpoint

```bash
# Backend: Clean build and restart
cd wemaster-nest
rm -rf dist
npm run build
pkill -f "nest start"
npm run start:dev
```

---

## Code Quality Standards

### TypeScript Conventions

**Backend (NestJS)**:
```typescript
// Files: kebab-case
user.service.ts
auth.controller.ts

// Classes: PascalCase
class UserService {}
class CreateUserDto {}

// Methods: camelCase
async createUser() {}
async getUserById() {}

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;
```

**Frontend (Next.js)**:
```typescript
// Components: PascalCase
function UserProfile() {}

// Hooks: camelCase with 'use' prefix
function useAuth() {}

// Utilities: camelCase
function formatDate() {}
```

### Naming Patterns

**DTOs**: `Create*Dto`, `Update*Dto`, `*ResponseDto`
**Services**: `*Service` (e.g., `UserService`)
**Controllers**: `*Controller` (e.g., `UserController`)
**Guards**: `*Guard` (e.g., `JwtAuthGuard`)
**Decorators**: `@*` (e.g., `@Roles()`, `@Public()`)

### Documentation

**Backend - Swagger**:
```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateUserDto) { /* ... */ }
}
```

**Frontend - JSDoc**:
```typescript
/**
 * Fetches user profile data
 * @param userId - The user's unique identifier
 * @returns User profile with courses and progress
 */
async function getUserProfile(userId: string): Promise<UserProfile> {
  // ...
}
```

---

## Critical Rules (Must Follow)

### Frontend
1. ✅ **Always use Orval-generated SDK** - Never hand-write API calls
2. ✅ **Always include tenantId** - Multi-tenant data isolation
3. ✅ **Always revalidate after mutations** - Cache invalidation
4. ✅ **Never import Prisma in frontend** - Backend-only
5. ✅ **Never handle business logic** - Backend-only

### Backend
6. ✅ **Always filter by tenantId** - Enforce tenant isolation
7. ✅ **Always use DTOs with validation** - Input validation
8. ✅ **Always use idempotency for mutations** - Prevent duplicates
9. ✅ **Always verify webhook signatures** - Security
10. ✅ **Always log critical operations** - Audit trail

### Database
11. ✅ **Always create migrations** - Never push to production
12. ✅ **Always test migrations locally** - Before deployment
13. ✅ **Always include rollback plan** - Safety net
14. ✅ **Never skip seed data updates** - Keep consistent

### Deployment
15. ✅ **Always test in staging first** - Never skip staging
16. ✅ **Always verify health checks** - After deployment
17. ✅ **Always have rollback ready** - Safety first
18. ✅ **Never deploy Friday evening** - Weekend availability

---

## Documentation Resources

### Project Documentation (docs/)
- `DEPLOY_PLAYBOOK.md` - Deployment procedures
- `DELIVERY_CHECKLIST.md` - Pre-deployment checklist
- `INTEGRATION_MILESTONE_REPORT.md` - Integration status
- `M5_MONITORING_DEPLOYMENT_COMPLETE.md` - Monitoring setup
- `PRODUCTION_SECURITY_PERFORMANCE_REPORT.md` - Security audit
- `STAGING_DEPLOYMENT_GUIDE.md` - Staging deployment
- `TEST_ENV_VALIDATION.md` - Test environment setup

### Contract Documentation
- Path: `/Volumes/BankChen/project-desgin/wemaster2/docs/api/`
- `API-INDEX.md` - Master index of all endpoints
- `openapi.yaml` - OpenAPI specification
- `VERIFICATION_REPORT.md` - Contract verification

### Module-Specific Documentation
- `wemaster-nest/CLAUDE.md` - Backend architecture
- `wemaster-core/CLAUDE.md` - Frontend architecture
- `AGENTS.md` - Multi-repo development guide
- `ARCHITECTURE_RULES.md` - Frontend-backend separation rules

### External Documentation
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Orval Docs](https://orval.dev)
- [Vue 3 Docs](https://vuejs.org)
- [Flutter Docs](https://flutter.dev/docs)

---

## Quick Reference

### Port Allocation
- `3000` - Next.js frontend (wemaster-core)
- `3001` - NestJS backend (wemaster-nest)
- `5173` - Vite admin frontend (wemaster-admin)
- `5432` - PostgreSQL
- `6379` - Redis
- `9090` - Prometheus
- `3000` - Grafana (Docker)
- `16686` - Jaeger

### Demo Credentials (After Seeding)
```
Tenant:   x-tenant-id: wemaster

Admin:    admin@wemaster.app / password123
Tutor:    tutor@wemaster.app / password123
Student:  student@wemaster.app / password123
```

### Health Check Endpoints
```
Backend:  http://localhost:3001/healthz
Frontend: http://localhost:3000/api/health
Admin:    http://localhost:5173/
```

### API Documentation
```
Swagger:  http://localhost:3001/docs
OpenAPI:  http://localhost:3001/api-json
```

---

**Last Updated**: November 2025
**Project Status**: Production-Ready (85-90% Complete)
**Maintainers**: WeMaster Engineering Team
