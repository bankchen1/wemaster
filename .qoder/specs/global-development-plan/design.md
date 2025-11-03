# WeMaster Platform - Global Development Plan

## Overview
This document outlines a comprehensive multi-stage development approach for the WeMaster tutoring platform, covering all three components: frontend (Next.js), backend (NestJS), and mobile (Flutter). The plan identifies key areas requiring attention, improvement, or further development, organized in phases with clear priorities and dependencies.

## Technical Architecture
The WeMaster platform follows a multi-tenant architecture with:
- **Frontend**: Next.js 15 with App Router, Tailwind CSS v4, React 19
- **Backend**: NestJS 11 with PostgreSQL (Prisma ORM), Redis, Stripe integration
- **Mobile**: Flutter with Riverpod state management
- **Infrastructure**: Multi-tenant support via `x-tenant-id` header or domain

## Component Design
The platform consists of three main components:
1. **wemaster-core** - Next.js frontend application (port 3000)
2. **wemaster-nest** - NestJS backend API (port 3001)
3. **wemaster-app-flutter** - Flutter mobile application

## Data Models
The platform uses a comprehensive Prisma schema with:
- Multi-tenancy support (Tenant, TenantConfig, TenantTheme)
- User management with role-based profiles (Student, Tutor, Admin)
- Course offerings and enrollment system
- Payment and order processing
- Session scheduling and booking
- Messaging and notifications
- Review and rating system

## API Specifications
The backend provides RESTful APIs with:
- Auto-generated Swagger documentation
- JWT-based authentication with RBAC
- Idempotency for critical operations
- Stripe webhook processing with deduplication

## Error Handling
- Centralized exception filtering with Sentry integration
- Rate limiting with multi-tier configuration
- Input validation using class-validator
- HTTP security headers with Helmet

## Testing Strategy
- Unit testing with Jest for backend
- End-to-end testing with Playwright for frontend
- Widget and integration testing for mobile
- Test coverage targets above 80% for core business logic

## Implementation Notes
- All write operations must check tenant context
- All Prisma queries must filter by `tenantId`
- Follow strict TypeScript typing throughout
- Maintain separation of concerns in NestJS modules