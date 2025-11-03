# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

This is a multi-repository project for the WeMaster tutoring platform, consisting of:

1. **wemaster-core** - Next.js frontend application
2. **wemaster-nest** - NestJS backend API
3. **wemaster-app-flutter** - Flutter mobile application

## Repository Structure

```
wemaster/
├── wemaster-core/          # Next.js frontend (port 3000)
├── wemaster-nest/          # NestJS backend API (port 3001)
└── wemaster-app-flutter/   # Flutter mobile app
```

## Development Commands

### wemaster-nest (Backend API)

**Core Development Commands:**
- `npm run start:dev` — Launch API with hot reload at `http://localhost:3001/api/v1`
- `npm run build && npm run start:prod` — Compile to `dist/` and run production bundle
- `npm run prisma:migrate|generate|seed` — Manage database schema and sample data
- `npm run prisma:studio` — Open Prisma Studio for DB inspection
- `npm test`, `npm run test:cov`, `npm run test:e2e` — Run unit, coverage, and e2e suites
- `npm run format`, `npm run lint` — Enforce Prettier and ESLint rules
- `npm run swagger:export`, `npm run contract:diff` — Sync OpenAPI spec and validate contract drift

**Database Management:**
- `npm run prisma:generate` — Generate Prisma client after schema changes
- `npm run prisma:migrate` — Create and apply database migrations
- `npm run prisma:seed` — Seed database with demo data
- `npm run prisma:studio` — Open Prisma Studio GUI for database inspection

**Testing Commands:**
- `npm run test` — Run all unit tests
- `npm run test:cov` — Run tests with coverage report
- `npm run test:e2e` — Run end-to-end tests
- `npm run test:watch` — Run tests in watch mode during development

### wemaster-core (Frontend)

**Core Development Commands:**
- `npm run dev` — Launches a hot-reloading server on `localhost:3000`
- `npm run build` — Runs `prisma generate` plus the production Next.js pass
- `npm run lint` — Enforces the flat ESLint config
- `npm run db:migrate` — For iterative database changes
- `npm run db:push` — To sync dev database
- `npm run db:seed` or `npm run db:reset` — For fixtures
- `npm run test:payment` — Executes the Stripe payment smoke test

### wemaster-app-flutter (Mobile)

**Core Development Commands:**
- `flutter pub get` — Install dependencies
- `flutter run` — Run on connected device/emulator
- `flutter build apk` — Build Android APK
- `flutter build ios` — Build iOS app
- `flutter test` — Run unit tests
- `flutter analyze` — Analyze code for issues

## Architecture Overview

### Backend (wemaster-nest)

**Key Architecture Components:**
1. **Multi-tenant Architecture** - Tenant resolution via `x-tenant-id` header or domain
2. **Authentication & Authorization** - JWT-based auth with role-based access control (RBAC)
3. **Idempotency** - Redis-backed idempotency for critical operations
4. **Webhook Handling** - Stripe webhook processing with deduplication
5. **API Documentation** - Auto-generated Swagger docs with contract-aligned DTOs

**Module Structure:**
```
src/
├── common/              # Shared utilities, decorators, filters, interceptors
├── config/              # Configuration module
├── core/                # Core features (auth, tenant, RBAC, idempotency)
│   ├── auth/           # Authentication module
│   ├── tenant/         # Multi-tenant middleware and context
│   ├── rbac/           # Role-based access control
│   └── idempotency/    # Idempotency interceptor
├── modules/             # Business modules
│   ├── offerings/      # Course management
│   ├── orders/         # Order management
│   ├── payments/       # Payment processing
│   ├── wallet/         # Student wallet system
│   ├── sessions/       # Session scheduling
│   ├── tutor/          # Tutor dashboard and availability
│   ├── student/        # Student dashboard
│   ├── admin/          # Admin panel
│   └── ...             # Other domain modules
├── infra/               # Infrastructure services
│   ├── prisma/         # Database service
│   ├── redis/          # Cache service
│   ├── stripe/         # Payment service
│   └── email/          # Email service
└── main.ts              # Application entry point
```

### Frontend (wemaster-core)

**Project Structure:**
- `app/` - App Router routes, segment-level layouts, and `globals.css`
- `components/` - Reusable UI components
- `shared/` - Cross-cutting utilities
- `lib/` - Server actions (email, payment, order)
- `domain/<feature>/` - Domain services that shield Prisma calls
- `prisma/` - Schema and seeds
- `scripts/` - Operational helpers

### Mobile (wemaster-app-flutter)

**Key Features:**
- Video calling integration with Agora
- Real-time messaging with Socket.IO
- Payment processing with Stripe
- State management with Riverpod
- Navigation with GoRouter

## Coding Standards

### Backend (NestJS)
- Controllers end in `.controller.ts`, services in `.service.ts`, DTOs in `dto/`
- Use strict TypeScript with proper typing for all functions and variables
- Follow NestJS module structure with clear separation of concerns
- Controllers should be thin - business logic belongs in services

### Frontend (Next.js)
- TypeScript runs in `strict` mode with path aliases (`@/*`, `@shared/*`)
- Prefer typed server actions and explicit return types
- Use PascalCase for React components/routes, camelCase for hooks and utilities
- Tailwind v4 for styling with logical grouping of utility classes

### Mobile (Flutter)
- Follow Flutter best practices and widget composition patterns
- Use Riverpod for state management
- Implement proper error handling and loading states
- Follow Dart naming conventions (camelCase for variables, PascalCase for classes)

## Testing Guidelines

### Backend Testing
- Write unit specs beside implementations as `*.spec.ts`
- Place e2e scenarios under `test/*.e2e-spec.ts`
- Mock external dependencies (Stripe, Redis, Email) in unit tests
- Use real database connections for integration tests
- Maintain test coverage above 80% for core business logic

### Frontend Testing
- Keep `npm run lint` and `npm run test:payment` green
- Add new integration scripts under `scripts/` and guard live dependencies
- Co-locate `*.spec.ts` beside domain logic
- Mock Prisma boundaries or seed via `npm run db:reset`

### Mobile Testing
- Write unit tests for business logic
- Use widget tests for UI components
- Implement integration tests for critical flows
- Use mockito for mocking dependencies

## Security Considerations

### Backend Security
- All write operations must check tenant context
- All Prisma queries must filter by `tenantId`
- Stripe webhooks rely on raw body middleware
- Implement proper input validation with class-validator
- Use Helmet for HTTP security headers

### Frontend Security
- Store secrets in `.env.local` and never commit them
- Validate all inputs on both client and server
- Implement proper authentication state management
- Use secure HTTP headers

### Mobile Security
- Store sensitive data in secure storage
- Implement proper authentication flows
- Validate all API responses
- Use secure network communication

## Deployment Considerations

### Backend
1. Set all environment variables
2. Configure PostgreSQL and Redis
3. Setup Stripe webhooks
4. Configure CORS origins
5. Run `npm run build`
6. Run migrations with `npx prisma migrate deploy`
7. Start with `npm run start:prod`

### Frontend
1. Set environment variables
2. Run `npm run build`
3. Deploy static files to hosting service
4. Configure domain and SSL

### Mobile
1. Update version and build numbers
2. Configure signing for release builds
3. Run `flutter build` for target platforms
4. Distribute through app stores

## Common Development Workflows

### Adding a New Feature
1. **Backend**: Create module, define Prisma models, implement services/controllers
2. **Frontend**: Create components, implement domain services, add routes
3. **Mobile**: Create screens, implement business logic, add navigation

### Database Schema Changes
1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create migration
3. Run `npm run prisma:generate` to update client
4. Update seed data if needed with `npm run prisma:seed`

### API Contract Changes
1. Update DTOs and Swagger documentation
2. Run `npm run swagger:export` to sync OpenAPI spec
3. Run `npm run contract:diff` to validate contract drift
4. Update frontend to match new contracts

## Troubleshooting

### Backend Build Issues
If modules don't load after adding new endpoints:
```bash
# Clean build artifacts and restart
rm -rf dist
npm run build

# Kill all running dev servers
pkill -f "nest start"

# Start fresh
npm run start:dev
```

### Frontend Issues
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies if needed
3. Check environment variables
4. Verify Prisma client generation

### Mobile Issues
1. Run `flutter pub get` to update dependencies
2. Clean build: `flutter clean`
3. Check platform-specific configurations
4. Verify environment variables