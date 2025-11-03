# WeMaster API Quick Start Guide

## Prerequisites
- Node.js 16+
- npm 8+
- PostgreSQL database
- Redis server

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd wemaster
```

### 2. Install Dependencies
```bash
cd wemaster-nest
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `wemaster-nest` directory with the required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wemaster

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=3600s

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# AWS
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=wemaster

# Email
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-email-password
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

## Running the Application

### Development Mode
```bash
cd wemaster-nest
npm run start:dev
```

The API will be available at `http://localhost:3001/api/v1`

### Production Mode
```bash
cd wemaster-nest
npm run build
npm run start:prod
```

## API Endpoints

### Health Check
- `GET /api/v1/healthz` - Basic health check
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### Student Community
All community endpoints require authentication (JWT Bearer token).

- `GET /api/v1/student/community/stats` - Get community statistics
- `GET /api/v1/student/community/feed` - Get social feed
- `POST /api/v1/student/community/posts` - Create a new post
- `GET /api/v1/student/community/posts/{postId}` - Get specific post
- `PUT /api/v1/student/community/posts/{postId}` - Update a post
- `DELETE /api/v1/student/community/posts/{postId}` - Delete a post
- `POST /api/v1/student/community/posts/{postId}/comments` - Add comment to post
- `GET /api/v1/student/community/study-groups` - Get study groups
- `POST /api/v1/student/community/study-groups` - Create study group
- `GET /api/v1/student/community/trending` - Get trending topics
- `GET /api/v1/student/community/connections` - Get connections
- `POST /api/v1/student/community/connections/{userId}/follow` - Follow user
- `POST /api/v1/student/community/connections/{userId}/unfollow` - Unfollow user
- `GET /api/v1/student/community/search` - Search users and content

### Testing
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## Common Issues and Solutions

### Port Already in Use
If you get an "EADDRINUSE" error:
```bash
# Kill processes using port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env file
3. Ensure database user has proper permissions

### Prisma Client Generation
If you encounter Prisma-related errors:
```bash
npm run prisma:generate
```

## Authentication
Most endpoints require a valid JWT token. Include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/v1/student/community/stats
```

To obtain a token, first register and then login using the auth endpoints.