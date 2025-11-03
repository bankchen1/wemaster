# WeMaster Project Context

## Project Overview

WeMaster is a comprehensive multi-tenant online learning platform built with Next.js 15 (frontend), NestJS (backend), and Flutter (mobile). The platform connects students with expert tutors for personalized 1-on-1 sessions, interactive courses, and flexible learning paths. It features course management, payment processing, real-time messaging, and VIP subscription systems.

## Project Structure

```
wemaster/
├── wemaster-core/          # Next.js 15 frontend
├── wemaster-nest/          # NestJS backend API
├── wemaster-app-flutter/   # Flutter mobile app
├── docs/                   # Documentation and reports
└── various markdown files  # Implementation summaries, plans, etc.
```

## Architecture Overview

The project follows a strict frontend-backend separation with a clear architectural constraint: the frontend must not contain any business logic, database operations, or direct third-party integrations. All business logic is handled by the backend.

### Frontend (wemaster-core)
- **Framework**: Next.js 15 with App Router
- **Architecture**: Provider-driven architecture using Orval-generated SDK
- **API Communication**: Direct API calls via Orval-generated client
- **State Management**: Server Actions, Zustand, React state
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Stack Auth integration
- **Payment**: Stripe integration via backend API calls

### Backend (wemaster-nest)
- **Framework**: NestJS v11
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Payment Processing**: Stripe integration with webhook handling
- **Authentication**: JWT-based authentication with role-based access control (RBAC)
- **Multi-tenancy**: Isolated data per tenant with configurable features
- **API Documentation**: Auto-generated Swagger documentation

### Mobile (wemaster-app-flutter)
- **Framework**: Flutter
- **Features**: Complete tutor booking, payment, virtual classroom, chat functionality
- **API Communication**: Direct API calls to backend
- **Real-time Features**: Agora RTC for video calling, Socket.IO for messaging

## Key Features

### Multi-tenancy
- Isolated data per tenant with custom configurations and themes
- Automatic tenant resolution via headers, subdomain, or defaults

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control (STUDENT, TUTOR, ADMIN)
- Stack Auth integration for Next.js frontend

### Course Management
- Offering creation with multiple variants (recorded, 1-on-1, group, trial)
- Course content with chapters, lessons, and materials
- Progress tracking and completion certificates

### Payment Processing
- Stripe integration for checkout sessions
- Order management system
- Webhook handling for payment events
- Wallet system with auto-reload capabilities

### Real-time Communication
- WebSocket-based messaging system
- Conversation management with participants
- Message read receipts and file attachments

### VIP Subscription System
- Tiered subscription system (Bronze, Silver, Gold)
- Recurring billing with Stripe
- Automatic renewals and trial management

### Tutor Earnings Management
- Automatic calculation of earnings and platform fees
- Hold periods for payments
- Payout scheduling and processing

## Technical Architecture

### Frontend Architecture
The frontend uses a provider-driven architecture where server actions call backend APIs via Orval-generated SDK:

1. **API Generation**: OpenAPI specification generates TypeScript types and client functions
2. **Server Actions**: Handle authentication and session management via cookies
3. **Direct API Calls**: No business logic on frontend - all processing happens in backend
4. **State Management**: Client components manage UI state, server components handle data fetching

### Backend Architecture
The backend follows a modular NestJS architecture:

1. **Core Modules**: Authentication, tenant management, RBAC, idempotency
2. **Business Modules**: Offerings, orders, payments, tutors, students, messages
3. **Infrastructure Services**: Prisma (database), Redis (cache), Stripe (payments), S3 (storage)
4. **Security**: JWT tokens, password hashing, CORS protection, input validation

### API Contract
- OpenAPI specification defines the contract between frontend and backend
- Orval generates TypeScript SDK from OpenAPI specification
- Strict separation: frontend handles UI only, backend handles business logic

## Development Workflow

### Frontend Development
1. Generate API client: `npm run api:generate`
2. Build: `npm run build`
3. Development: `npm run dev`
4. Test: `npm run test` or `npm run test:e2e`

### Backend Development
1. Generate Prisma client: `npm run prisma:generate`
2. Migrate database: `npm run prisma:migrate`
3. Seed database: `npm run prisma:seed`
4. Development: `npm run start:dev`
5. Production: `npm run start:prod`

### Environment Setup

#### Frontend (.env.local)
```
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
STACK_AUTH_PROJECT_ID=your_project_id
STACK_AUTH_API_KEY=your_api_key
NEXT_PUBLIC_STACK_AUTH_PUBLISHABLE_KEY=your_publishable_key
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/wemaster
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DEFAULT_TENANT=wemaster
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Architecture Rules

The project enforces strict separation of concerns:

### Frontend (wemaster-core) - UI Only
- ✅ UI rendering (React Components)
- ✅ API calls via Orval SDK
- ✅ Client state management
- ✅ Routing and navigation
- ❌ No database operations (Prisma)
- ❌ No business logic
- ❌ No direct third-party integrations
- ❌ No sensitive operations (password hashing, JWT generation)

### Backend (wemaster-nest) - Business Logic
- ✅ All business logic
- ✅ Database operations via Prisma
- ✅ Email sending
- ✅ Third-party service integrations (Stripe, etc.)
- ✅ Authentication and authorization
- ✅ Payment processing

## Key Implementation Notes

### Authentication Flow
1. Frontend calls `/api/v1/auth/login` via Orval SDK
2. Backend validates credentials and returns JWT tokens
3. Frontend stores tokens in secure cookies
4. All subsequent API calls include Authorization header
5. Backend validates JWT on each request

### Multi-tenancy Implementation
1. Tenant ID passed via `x-tenant-id` header
2. Prisma middleware automatically filters queries by tenant
3. Tenant-specific configurations available in request context
4. Data isolation ensured at database level

### Payment Flow
1. Frontend calls `/api/v1/orders/draft` to create order and get checkout URL
2. User redirected to Stripe checkout
3. Stripe sends webhook to `/api/v1/payments/webhooks/stripe`
4. Backend processes webhook and updates order/payment status
5. User redirected back to frontend with payment result

## Error Monitoring
- Sentry integration for error tracking
- Comprehensive logging with Pino in backend
- Custom error handling with standardized responses

## Testing
- Unit tests for business logic
- End-to-end API tests
- Frontend integration tests
- Database migration testing
- Payment flow testing

## Deployment
- Frontend: Vercel (recommended)
- Backend: Any Node.js hosting platform
- Database: PostgreSQL
- Cache: Redis
- Payment processing: Stripe