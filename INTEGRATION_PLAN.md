# WeMaster Frontend-Backend Integration Plan

## Executive Summary

This document outlines a comprehensive plan to achieve 100% integration between the WeMaster frontend (Next.js) and backend (NestJS) systems. The integration will be driven by frontend requirements with automated code generation to minimize glue code.

## Current Status

### Frontend (wemaster-core)
- **Architecture**: Next.js 15 with App Router
- **API Integration**: Orval-generated SDK with server-side authentication
- **Implemented Pages**: Student dashboard, courses, assignments, progress, schedule, messages, VIP
- **State Management**: Server Components for data fetching, client components for interaction

### Backend (wemaster-nest)
- **Architecture**: NestJS with multi-tenant support
- **API Coverage**: 64% of contract endpoints implemented (57/89)
- **Missing Endpoints**: 15 critical endpoints (16.9%)
- **Test Coverage**: Low E2E test coverage

## Integration Strategy

### 1. Automated Code Generation
**Orval SDK Generation**
- Continue using Orval to generate TypeScript SDK from OpenAPI specification
- Maintain `withServerAuthBatch` wrapper for seamless authentication
- Generate both frontend SDK and backend DTO validation

**DTO Consistency**
- Generate shared DTOs from OpenAPI spec to ensure field consistency
- Use Zod schemas for frontend validation
- Implement class-validator for backend validation

### 2. Contract-First Development
**Single Source of Truth**
- Use OpenAPI specification as the contract between frontend and backend
- Implement automated contract validation in CI/CD pipeline
- Generate TypeScript types from API contracts for both sides

**Version Management**
- Maintain versioned API contracts
- Implement backward compatibility strategy
- Add deprecation warnings for legacy endpoints

### 3. Efficient Development Workflow
**API-First Approach**
- Implement frontend components with mocked data first
- Connect to real APIs once backend endpoints are ready
- Use generated SDK types for type safety

**Rapid Iteration**
- Generate SDK automatically when API changes
- Validate frontend-backend compatibility during development
- Minimize manual API integration code

## Implementation Roadmap

### Phase 1: Critical Missing APIs (Week 1-2)
**Priority**: 🔴 HIGH

1. **Browse Tutors Endpoint** (`GET /api/v1/tutors/browse`)
   - Fix route prefix bug in existing controller
   - Align request/response DTOs with contract schema
   - Add comprehensive filtering capabilities

2. **Quick Book Session Endpoint** (`POST /api/v1/student/dashboard/quick-actions/book-session`)
   - Create endpoint for quick booking next available session
   - Integrate with tutor availability system
   - Add proper validation and error handling

### Phase 2: Student Dashboard Completeness (Week 2-3)
**Priority**: 🟡 MEDIUM

3. **Achievements Endpoint** (`GET /api/v1/student/dashboard/achievements`)
   - Create endpoint for fetching earned achievements and badges
   - Design data structure for achievement tracking
   - Integrate with existing points system

4. **Study Streak Endpoint** (`GET /api/v1/student/dashboard/study-streak`)
   - Create endpoint for getting current study streak and calendar data
   - Design data aggregation logic
   - Add proper caching strategy

5. **Recommendations Endpoint** (`GET /api/v1/student/dashboard/recommendations`)
   - Create endpoint for personalized course/tutor recommendations
   - Design recommendation algorithm
   - Add proper caching strategy

### Phase 3: Wallet System Completion (Week 3-4)
**Priority**: 🟡 MEDIUM

6. **Invoice Management Endpoints**
   - `GET /api/v1/student/wallet/invoices` - Retrieve invoices and receipts
   - `GET /api/v1/student/wallet/invoices/:invoiceId/download` - Download invoice PDF
   - `GET /api/v1/student/wallet/spending-analytics` - Get spending analytics and insights

7. **Dispute Management Endpoints**
   - `POST /api/v1/student/wallet/disputes/create` - Create payment dispute
   - `GET /api/v1/student/wallet/disputes/:disputeId` - Get dispute status

### Phase 4: Testing and Quality Assurance (Week 4-5)
**Priority**: 🟢 ONGOING

8. **Comprehensive E2E Tests**
   - Write E2E tests for all student dashboard APIs
   - Add integration tests for critical user flows
   - Implement contract testing to ensure frontend-backend alignment

9. **API Documentation and Examples**
   - Update OpenAPI specification with missing endpoints
   - Add example requests/responses
   - Document error cases

### Phase 5: Performance and Monitoring (Week 5-6)
**Priority**: 🟢 ONGOING

10. **Caching Strategy**
    - Add Redis caching for frequently accessed data
    - Implement cache invalidation patterns
    - Add performance monitoring

11. **Comprehensive Logging**
    - Add structured logging for all API endpoints
    - Implement request tracing
    - Add performance metrics

## Technical Implementation Details

### API Contract Management
```
Project Structure:
wemaster/
├── contracts/
│   ├── api/
│   │   ├── student-dashboard.yaml
│   │   ├── course-management.yaml
│   │   ├── wallet-system.yaml
│   │   └── tutor-browse.yaml
│   └── scripts/
│       ├── generate-sdk.sh
│       └── validate-contract.sh
├── wemaster-core/
│   └── lib/api/generated/
└── wemaster-nest/
    └── src/contract/
```

### Automated SDK Generation
```bash
# Generate frontend SDK
orval --config ./orval.config.ts

# Generate backend DTOs
openapi-typescript ./contracts/api/*.yaml -o ./wemaster-nest/src/contract/types.ts
```

### Frontend Integration Pattern
```typescript
// Server Component - data fetching
export default async function StudentDashboardPage() {
  const [dashboardData, upcomingLessonsData] = await withServerAuthBatch([
    () => studentControllerGetDashboardOverview(),
    () => studentControllerGetUpcomingLessons(),
  ]);
  
  return <StudentDashboardClient dashboard={dashboardData} lessons={upcomingLessonsData} />;
}

// Client Component - interaction
'use client'
export function StudentDashboardClient({ dashboard, lessons }: Props) {
  const { mutate } = useJoinLesson();
  
  const handleJoinLesson = (lessonId: string) => {
    mutate({ lessonId });
  };
  
  return (
    <DashboardUI 
      data={dashboard} 
      lessons={lessons} 
      onJoinLesson={handleJoinLesson} 
    />
  );
}
```

### Backend Implementation Pattern
```typescript
// Controller
@Controller('student')
export class StudentController {
  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get student dashboard overview' })
  async getDashboardOverview(
    @User('id') userId: string,
    @Query() query: DashboardOverviewQueryDto,
  ): Promise<DashboardOverviewResponseDto> {
    return this.studentService.getDashboardOverview(userId, query);
  }
}

// Service
@Injectable()
export class StudentService {
  async getDashboardOverview(
    studentId: string,
    query: DashboardOverviewQueryDto,
  ): Promise<DashboardOverviewResponseDto> {
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, role: 'STUDENT' },
      include: { studentProfile: true },
    });
    
    // Business logic implementation
    return this.mapToDashboardResponse(student);
  }
}
```

## Quality Assurance

### Contract Testing
- Implement automated contract validation
- Add schema validation for all API endpoints
- Generate test cases from API contracts

### Performance Monitoring
- Add response time metrics for all endpoints
- Implement error rate tracking
- Add database query performance monitoring

### Security Validation
- Validate all input parameters
- Implement proper authentication and authorization
- Add rate limiting for API endpoints

## Success Metrics

### Integration Completion
- ✅ 100% API contract implementation
- ✅ Zero manual API integration code
- ✅ Automated SDK generation pipeline
- ✅ Comprehensive test coverage

### Performance Targets
- ✅ API response time < 200ms for 95% of requests
- ✅ 99.9% uptime for critical endpoints
- ✅ < 1% error rate for all APIs

### Development Efficiency
- ✅ < 1 hour to add new API endpoint
- ✅ Zero frontend-backend integration bugs
- ✅ Automated contract validation in CI/CD

## Next Steps

1. **Week 1**: Implement browse tutors and quick book session endpoints
2. **Week 2**: Add comprehensive E2E tests for existing APIs
3. **Week 3**: Implement remaining student dashboard endpoints
4. **Week 4**: Complete wallet system endpoints
5. **Week 5**: Add performance monitoring and caching
6. **Week 6**: Final integration testing and documentation

This plan ensures a systematic approach to achieving complete frontend-backend integration with minimal manual effort and maximum reliability.