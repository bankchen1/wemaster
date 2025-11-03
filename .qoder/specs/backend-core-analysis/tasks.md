# Backend Core Modules - Implementation Tasks

## Overview
This document outlines the implementation tasks needed to address the gaps, issues, and areas for improvement identified in the backend core modules analysis. The tasks are organized by priority and module, with specific file paths and clear objectives.

## Implementation Tasks

### Priority 1: Critical Security Issues

- [ ] 1. **Re-enable Tenant Filtering Middleware**
  - Research and implement Prisma Client Extensions to replace deprecated $use middleware
  - Update PrismaService to use the new extension-based approach
  - Test tenant isolation thoroughly to ensure no cross-tenant data access
  - File: `wemaster-nest/src/infra/prisma/prisma.service.ts`
  - File: `wemaster-nest/src/infra/prisma/middleware/tenant-filter.middleware.ts`

- [ ] 2. **Security Testing for Tenant Isolation**
  - Implement comprehensive tests to verify tenant data isolation
  - Add integration tests that attempt cross-tenant data access
  - File: `wemaster-nest/src/infra/prisma/prisma.service.spec.ts` (new)
  - File: `wemaster-nest/test/tenant-isolation.e2e-spec.ts` (new)

### Priority 2: Authentication Enhancements

- [ ] 3. **Implement Refresh Token Rotation**
  - Add refresh token generation and storage
  - Implement refresh token rotation and invalidation
  - Update AuthService with refresh token endpoints
  - File: `wemaster-nest/src/core/auth/auth.service.ts`
  - File: `wemaster-nest/src/core/auth/auth.controller.ts`
  - File: `wemaster-nest/src/core/auth/dto/refresh-token.dto.ts` (new)

- [ ] 4. **Add Multi-Factor Authentication (MFA) Support**
  - Implement TOTP-based MFA
  - Add MFA enrollment and verification endpoints
  - Update user model to support MFA status
  - File: `wemaster-nest/src/core/auth/mfa.service.ts` (new)
  - File: `wemaster-nest/src/core/auth/mfa.controller.ts` (new)

### Priority 3: RBAC System Enhancement

- [ ] 5. **Implement Permission-Based Access Control**
  - Create permissions model and database schema
  - Implement permission checking guard
  - Update RolesGuard to support both roles and permissions
  - File: `wemaster-nest/src/common/guards/permissions.guard.ts` (new)
  - File: `wemaster-nest/src/common/decorators/permissions.decorator.ts` (new)

- [ ] 6. **Add Hierarchical Role System**
  - Implement role hierarchy with inheritance
  - Update permission checking to respect role hierarchy
  - File: `wemaster-nest/src/common/guards/roles.guard.ts`

### Priority 4: Idempotency Improvements

- [ ] 7. **Add Configuration Options for Idempotency**
  - Make TTL and lock duration configurable
  - Add configuration validation
  - File: `wemaster-nest/src/core/idempotency/idempotency.interceptor.ts`

- [ ] 8. **Implement Idempotency Metrics**
  - Add Prometheus metrics for idempotency usage
  - Track cache hit rates and conflict rates
  - File: `wemaster-nest/src/core/idempotency/idempotency.metrics.ts` (new)

### Priority 5: Webhook System Enhancement

- [ ] 9. **Implement Webhook Retry Mechanism**
  - Add retry logic with exponential backoff
  - Implement dead letter queue for failed webhooks
  - File: `wemaster-nest/src/modules/payments/payments.service.ts`

- [ ] 10. **Add Generic Webhook Framework**
  - Create abstract webhook handler class
  - Implement webhook endpoint management
  - Add webhook delivery guarantees
  - File: `wemaster-nest/src/common/webhooks/webhook.handler.ts` (new)
  - File: `wemaster-nest/src/common/webhooks/webhook.module.ts` (new)

### Priority 6: Performance and Monitoring

- [ ] 11. **Implement Tenant Lookup Caching**
  - Add Redis caching for tenant resolution
  - Implement cache invalidation strategy
  - File: `wemaster-nest/src/core/tenant/tenant.middleware.ts`

- [ ] 12. **Add Comprehensive Monitoring**
  - Implement distributed tracing for core modules
  - Add health checks for all critical components
  - File: `wemaster-nest/src/infra/health/health.service.ts`

### Priority 7: Testing and Documentation

- [ ] 13. **Add Unit Tests for Core Modules**
  - Implement comprehensive unit tests for all core modules
  - Add test coverage reporting
  - File: Various `.spec.ts` files throughout core modules

- [ ] 14. **Update Documentation**
  - Document the new features and improvements
  - Update API documentation with new endpoints
  - File: `wemaster-nest/docs/core-modules.md` (new)

## Files to Create/Modify

### Core Authentication Files
- `wemaster-nest/src/core/auth/auth.service.ts` - Add refresh token functionality
- `wemaster-nest/src/core/auth/auth.controller.ts` - Add refresh token endpoints
- `wemaster-nest/src/core/auth/mfa.service.ts` - New MFA service implementation
- `wemaster-nest/src/core/auth/mfa.controller.ts` - New MFA controller

### Tenant Module Files
- `wemaster-nest/src/infra/prisma/prisma.service.ts` - Re-enable tenant filtering with extensions
- `wemaster-nest/src/infra/prisma/middleware/tenant-filter.middleware.ts` - Update to work with extensions

### RBAC Files
- `wemaster-nest/src/common/guards/permissions.guard.ts` - New permission-based guard
- `wemaster-nest/src/common/decorators/permissions.decorator.ts` - New permissions decorator
- `wemaster-nest/src/common/guards/roles.guard.ts` - Update to support role hierarchy

### Idempotency Files
- `wemaster-nest/src/core/idempotency/idempotency.interceptor.ts` - Add configuration options
- `wemaster-nest/src/core/idempotency/idempotency.metrics.ts` - New metrics implementation

### Webhook Files
- `wemaster-nest/src/modules/payments/payments.service.ts` - Add retry mechanism
- `wemaster-nest/src/common/webhooks/webhook.handler.ts` - New generic webhook framework
- `wemaster-nest/src/common/webhooks/webhook.module.ts` - New webhook module

### Testing Files
- `wemaster-nest/src/infra/prisma/prisma.service.spec.ts` - New tests for tenant filtering
- `wemaster-nest/test/tenant-isolation.e2e-spec.ts` - New end-to-end tests for tenant isolation
- Various `.spec.ts` files for new functionality

### Documentation Files
- `wemaster-nest/docs/core-modules.md` - New documentation for core modules

## Success Criteria

- [ ] Tenant filtering middleware is re-enabled and working correctly
- [ ] No cross-tenant data access is possible
- [ ] Refresh token rotation is implemented and secure
- [ ] Permission-based access control is functional
- [ ] Idempotency is configurable and monitored
- [ ] Webhook system has retry mechanisms and delivery guarantees
- [ ] All new functionality is covered by unit and integration tests
- [ ] Performance is maintained or improved
- [ ] Documentation is updated and comprehensive
- [ ] All existing functionality continues to work as expected