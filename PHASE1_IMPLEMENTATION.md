# Phase 1: Critical Missing APIs Implementation

## Task 1: Fix Browse Tutors Endpoint

### Current Status
- Backend has `/api/v1/api/v1/tutors/browse` (double prefix bug)
- Needs fixing and contract alignment

### Implementation Steps

1. **Fix Route Prefix Bug**
   - Location: `src/modules/tutors/browse-tutors.controller.ts`
   - Remove duplicate `/api/v1/` prefix
   - Verify correct route: `/api/v1/tutors/browse`

2. **Align with Contract Schema**
   - Review `tutor-browse.md` contract document
   - Update request DTOs:
     - Search filters (subject, language, rating, price range)
     - Pagination parameters
     - Sorting options
   - Update response DTOs:
     - Tutor profile information
     - Rating and review data
     - Availability information
     - Pricing details

3. **Implement Filtering Logic**
   - Add subject filtering capability
   - Implement language filtering
   - Add rating-based filtering
   - Implement price range filtering
   - Add availability-based filtering

4. **Add Comprehensive Tests**
   - Unit tests for filtering logic
   - Integration tests for API endpoint
   - Performance tests for large datasets

### Files to Modify
- `src/modules/tutors/browse-tutors.controller.ts`
- `src/modules/tutors/dto/browse-tutors.dto.ts`
- `src/modules/tutors/tutors.service.ts`

## Task 2: Implement Quick Book Session Endpoint

### Requirements
- Endpoint: `POST /api/v1/student/dashboard/quick-actions/book-session`
- Functionality: Quick book next available session with tutor
- Priority: HIGH (critical user flow)

### Implementation Steps

1. **Create Controller Method**
   - Add to `StudentController`
   - Implement proper Swagger documentation
   - Add authentication and authorization guards

2. **Design Request/Response DTOs**
   - Request: subject, duration, preferred time range
   - Response: booking confirmation, meeting details

3. **Implement Business Logic**
   - Find next available tutor slot
   - Validate student eligibility
   - Create session booking
   - Send confirmation notifications

4. **Add Validation and Error Handling**
   - Input validation
   - Availability checking
   - Conflict detection
   - Proper error responses

### Files to Create/Modify
- `src/modules/student/dto/quick-book.dto.ts`
- Add method to `src/modules/student/student.controller.ts`
- Add method to `src/modules/student/student.service.ts`

## Implementation Timeline
- **Days 1-2**: Fix browse tutors endpoint
- **Days 3-4**: Implement quick book session endpoint
- **Days 5-6**: Add comprehensive tests
- **Days 7**: Integration testing and documentation

## Success Criteria
- ✅ Browse tutors endpoint returns correct data structure
- ✅ Quick book session endpoint successfully creates bookings
- ✅ All filtering options work correctly
- ✅ Proper error handling for edge cases
- ✅ Comprehensive test coverage
- ✅ API documentation updated