# Frontend Domain Services Implementation Design

## Overview

This document outlines the design for implementing the complete frontend domain services architecture for the WeMaster platform. The implementation will focus on completing the provider pattern that has been partially implemented in the core infrastructure.

## Technical Architecture

### Provider Pattern Structure

The domain services will follow a dual-provider pattern:
1. **Mock Providers** - For development and testing environments
2. **Real Providers** - For production environments that connect to backend APIs

### Core Components

1. **Provider Factory** - Centralized factory for creating and managing providers
2. **Provider Interfaces** - Standardized interfaces for all domain services
3. **Provider Implementations** - Concrete implementations for both mock and real providers
4. **Standardized Response Types** - Consistent success/error response formats
5. **Error Handling** - Standardized error codes and handling mechanisms

## Component Design

### 1. Provider Factory

The provider factory is already implemented and provides:
- Singleton pattern for provider management
- Environment-based switching between mock and real providers
- Type-safe provider access
- Standardized provider registration

### 2. Provider Interfaces

Seven core domain service interfaces need to be fully implemented:

#### IAuthProvider
```typescript
interface IAuthProvider extends BaseProvider {
  login(credentials: LoginDto): Promise<ProviderResult<AuthResponseDto>>;
  register(data: RegisterDto): Promise<ProviderResult<AuthResponseDto>>;
  logout(): Promise<ProviderResult<void>>;
  getCurrentUser(): Promise<ProviderResult<UserDto>>;
  updateProfile(userId: string, data: UpdateProfileDto): Promise<ProviderResult<UserDto>>;
}
```

#### IOfferingProvider
```typescript
interface IOfferingProvider extends BaseProvider {
  getOfferingById(id: string): Promise<ProviderResult<OfferingDto>>;
  getOfferings(filter?: OfferingFilterDto): Promise<ProviderResult<OfferingDto[]>>;
  createOffering(data: CreateOfferingDto): Promise<ProviderResult<OfferingDto>>;
  updateOffering(id: string, data: UpdateOfferingDto): Promise<ProviderResult<OfferingDto>>;
  deleteOffering(id: string): Promise<ProviderResult<void>>;
  addToWishlist(userId: string, offeringId: string): Promise<ProviderResult<void>>;
  removeFromWishlist(userId: string, offeringId: string): Promise<ProviderResult<void>>;
}
```

#### IPaymentProvider
```typescript
interface IPaymentProvider extends BaseProvider {
  createCheckoutSession(data: CreateCheckoutSessionDto): Promise<ProviderResult<CheckoutSessionDto>>;
  processPayment(data: ProcessPaymentDto): Promise<ProviderResult<PaymentDto>>;
  refundPayment(paymentId: string, amount: number): Promise<ProviderResult<RefundDto>>;
  getPaymentById(id: string): Promise<ProviderResult<PaymentDto>>;
}
```

#### IOrderProvider
```typescript
interface IOrderProvider extends BaseProvider {
  getOrderById(id: string): Promise<ProviderResult<OrderDto>>;
  getOrders(filter?: OrderFilterDto): Promise<ProviderResult<OrderDto[]>>;
  createOrder(data: CreateOrderDto): Promise<ProviderResult<OrderDto>>;
  updateOrder(id: string, data: UpdateOrderDto): Promise<ProviderResult<OrderDto>>;
  cancelOrder(id: string): Promise<ProviderResult<void>>;
}
```

#### IUserProvider
```typescript
interface IUserProvider extends BaseProvider {
  getUserById(id: string): Promise<ProviderResult<UserDto>>;
  getUserByEmail(tenantId: string, email: string): Promise<ProviderResult<UserDto>>;
  getUsers(filter?: UserFilterDto): Promise<ProviderResult<UserDto[]>>;
  createUser(data: CreateUserDto): Promise<ProviderResult<UserDto>>;
  updateUser(id: string, data: UpdateUserDto): Promise<ProviderResult<UserDto>>;
  deleteUser(id: string): Promise<ProviderResult<void>>;
}
```

#### ITenantProvider
```typescript
interface ITenantProvider extends BaseProvider {
  findById(id: string): Promise<ProviderResult<TenantDto>>;
  findOne(filter: TenantFilterDto): Promise<ProviderResult<TenantDto>>;
  findMany(options?: TenantQueryOptions): Promise<ProviderResult<TenantDto[]>>;
  create(data: CreateTenantDto): Promise<ProviderResult<TenantDto>>;
  update(id: string, data: UpdateTenantDto): Promise<ProviderResult<TenantDto>>;
}
```

#### IEmailProvider
```typescript
interface IEmailProvider extends BaseProvider {
  sendEmail(data: SendEmailDto): Promise<ProviderResult<EmailResponseDto>>;
  sendTemplateEmail(template: EmailTemplate, data: TemplateData): Promise<ProviderResult<EmailResponseDto>>;
}
```

### 3. Provider Implementations

#### Mock Providers
Mock providers will use the existing `MockStorage` system for data persistence:
- Implement realistic data generation
- Support data persistence with localStorage
- Include TTL for data expiration
- Support tenant isolation

#### Real Providers
Real providers will connect to the backend via the Orval-generated SDK:
- Use the existing `apiClient` for HTTP requests
- Implement proper error mapping to provider error codes
- Add request/response logging for debugging
- Handle authentication and tenant context

## Data Models

### ProviderResult<T>
```typescript
type ProviderResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };
```

### Standard Error Codes
The system will use the existing `PROVIDER_ERROR_CODES` constant with codes for all domains:
- Authentication errors
- Payment processing errors
- Data validation errors
- Network errors
- Business logic errors

## API Specifications

### Backend Integration
Real providers will integrate with the backend using:
1. **Orval-generated SDK** - Type-safe API client
2. **Axios Wrapper** - Custom API client with interceptors
3. **Server Actions** - For operations requiring server-side execution

### Request/Response Format
All API interactions will follow the standardized format:
- Requests: DTO objects with validation
- Responses: Standardized success/error format
- Error Handling: Consistent error codes and messages

## Error Handling Strategy

### Error Code Standardization
All providers will use the standardized error codes defined in `PROVIDER_ERROR_CODES`:
- Domain-specific error codes (e.g., `AUTH_LOGIN_FAILED`, `PAYMENT_CHECKOUT_FAILED`)
- Generic error codes (e.g., `VALIDATION_ERROR`, `UNKNOWN_ERROR`)

### Error Mapping
Real providers will map backend errors to standardized provider error codes:
- HTTP status code mapping
- Backend error code translation
- Detailed error information preservation

### Error Logging
All errors will be logged with:
- Sentry integration for error tracking
- Context information for debugging
- User impact assessment

## Testing Strategy

### Unit Testing
Each provider implementation will have comprehensive unit tests:
- Success scenarios
- Error scenarios
- Edge cases
- Data validation

### Integration Testing
Provider integration with:
- Mock storage system
- Backend API
- Authentication system
- Tenant context management

### Mock Data Testing
Mock providers will be tested with:
- Data persistence
- Tenant isolation
- TTL expiration
- Data consistency

## Implementation Notes

### 1. Provider Implementation Priority
1. Auth Provider (highest priority - authentication is critical)
2. Offering Provider (core business functionality)
3. Payment Provider (revenue-generating feature)
4. Order Provider (business workflow completion)
5. User Provider (user management)
6. Tenant Provider (multi-tenancy support)
7. Email Provider (notifications and communication)

### 2. Data Consistency
- Implement proper data validation in all provider methods
- Ensure consistent data formats between mock and real providers
- Handle data synchronization between frontend and backend

### 3. Performance Considerations
- Implement caching strategies for frequently accessed data
- Add request batching for multiple operations
- Optimize data loading with pagination and filtering

### 4. Security Considerations
- Ensure proper authentication for all provider operations
- Validate all input data
- Sanitize output data
- Implement proper error handling without exposing sensitive information

### 5. Tenant Isolation
- Ensure all provider operations respect tenant boundaries
- Implement tenant-specific data storage
- Validate tenant context in all operations

## File Structure

```
wemaster-core/lib/
├── core/
│   ├── provider-types.ts          # Provider interfaces and types
│   ├── provider-factory.ts         # Provider factory implementation
│   ├── mock-storage.ts            # Mock storage system
│   └── index.ts                   # Public API exports
├── auth/
│   ├── provider.ts                # Auth provider implementations
│   ├── types.ts                   # Auth-specific types
│   └── actions.ts                 # Server actions
├── offering/
│   ├── provider.ts                # Offering provider implementations
│   ├── types.ts                   # Offering-specific types
│   └── actions.ts                 # Server actions
├── payment/
│   ├── provider.ts                # Payment provider implementations
│   ├── types.ts                   # Payment-specific types
│   └── actions.ts                 # Server actions
├── order/
│   ├── provider.ts                # Order provider implementations
│   ├── types.ts                   # Order-specific types
│   └── actions.ts                 # Server actions
├── user/
│   ├── provider.ts                # User provider implementations
│   ├── types.ts                   # User-specific types
│   └── actions.ts                 # Server actions
├── tenant/
│   ├── provider.ts                # Tenant provider implementations
│   ├── types.ts                   # Tenant-specific types
│   └── actions.ts                 # Server actions
└── email/
    ├── provider.ts                # Email provider implementations
    ├── types.ts                   # Email-specific types
    └── actions.ts                 # Server actions
```

## Migration Strategy

### Phase 1: Core Implementation
1. Complete provider interfaces definition
2. Implement mock provider base classes
3. Implement real provider base classes
4. Create provider registration system

### Phase 2: Provider Implementation
1. Implement Auth provider (mock and real)
2. Implement Offering provider (mock and real)
3. Implement Payment provider (mock and real)
4. Implement Order provider (mock and real)
5. Implement User provider (mock and real)
6. Implement Tenant provider (mock and real)
7. Implement Email provider (mock and real)

### Phase 3: Integration
1. Migrate existing direct API calls to provider pattern
2. Update server actions to use providers
3. Implement caching layer
4. Add comprehensive error handling

### Phase 4: Testing and Optimization
1. Add unit tests for all providers
2. Add integration tests
3. Performance optimization
4. Documentation updates

## Success Criteria

1. All 7 domain providers fully implemented with mock and real versions
2. Complete migration from direct API calls to provider pattern
3. Comprehensive test coverage (80%+)
4. Consistent error handling across all providers
5. Proper tenant isolation in all operations
6. Performance benchmarks met
7. Documentation complete and accurate