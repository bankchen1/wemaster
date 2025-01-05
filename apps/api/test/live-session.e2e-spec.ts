import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

describe('LiveSession (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'tutor',
  };

  const mockBooking = {
    id: 'booking-1',
    tutorId: mockUser.id,
    studentId: 'student-1',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
        getRequest: () => ({ user: mockUser }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    // 设置全局前缀和验证管道
    app.setGlobalPrefix('api');
    await app.init();

    // 创建测试数据
    await prisma.booking.create({
      data: mockBooking,
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.booking.deleteMany({
      where: { id: mockBooking.id },
    });
    await app.close();
  });

  describe('/api/live/sessions (POST)', () => {
    it('should create a live session', () => {
      return request(app.getHttpServer())
        .post('/api/live/sessions')
        .send({ bookingId: mockBooking.id })
        .expect(201)
        .expect(res => {
          expect(res.body.data).toHaveProperty('session');
          expect(res.body.data).toHaveProperty('tutorToken');
          expect(res.body.data).toHaveProperty('studentToken');
          expect(res.body.data.session.bookingId).toBe(mockBooking.id);
        });
    });

    it('should fail with invalid booking id', () => {
      return request(app.getHttpServer())
        .post('/api/live/sessions')
        .send({ bookingId: 'invalid-id' })
        .expect(404)
        .expect(res => {
          expect(res.body.message).toBe('Booking not found');
        });
    });
  });

  describe('/api/live/sessions/:id/start (POST)', () => {
    let sessionId: string;

    beforeEach(async () => {
      // 创建一个新的会话
      const res = await request(app.getHttpServer())
        .post('/api/live/sessions')
        .send({ bookingId: mockBooking.id });
      sessionId = res.body.data.session.id;
    });

    it('should start a live session', () => {
      return request(app.getHttpServer())
        .post(`/api/live/sessions/${sessionId}/start`)
        .expect(200)
        .expect(res => {
          expect(res.body.data.status).toBe('active');
          expect(res.body.data.actualStartTime).toBeDefined();
        });
    });

    it('should fail with invalid session id', () => {
      return request(app.getHttpServer())
        .post('/api/live/sessions/invalid-id/start')
        .expect(404)
        .expect(res => {
          expect(res.body.message).toBe('Session not found');
        });
    });
  });

  describe('/api/live/sessions/:id/end (POST)', () => {
    let sessionId: string;

    beforeEach(async () => {
      // 创建并开始一个新的会话
      const res = await request(app.getHttpServer())
        .post('/api/live/sessions')
        .send({ bookingId: mockBooking.id });
      sessionId = res.body.data.session.id;

      await request(app.getHttpServer())
        .post(`/api/live/sessions/${sessionId}/start`);
    });

    it('should end a live session', () => {
      return request(app.getHttpServer())
        .post(`/api/live/sessions/${sessionId}/end`)
        .expect(200)
        .expect(res => {
          expect(res.body.data.status).toBe('completed');
          expect(res.body.data.actualEndTime).toBeDefined();
        });
    });

    it('should fail with invalid session id', () => {
      return request(app.getHttpServer())
        .post('/api/live/sessions/invalid-id/end')
        .expect(404)
        .expect(res => {
          expect(res.body.message).toBe('Session not found');
        });
    });
  });

  describe('/api/live/sessions/:id/participants (GET)', () => {
    let sessionId: string;

    beforeEach(async () => {
      // 创建一个新的会话
      const res = await request(app.getHttpServer())
        .post('/api/live/sessions')
        .send({ bookingId: mockBooking.id });
      sessionId = res.body.data.session.id;
    });

    it('should get session participants', () => {
      return request(app.getHttpServer())
        .get(`/api/live/sessions/${sessionId}/participants`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body.data.participants)).toBe(true);
        });
    });

    it('should fail with invalid session id', () => {
      return request(app.getHttpServer())
        .get('/api/live/sessions/invalid-id/participants')
        .expect(404)
        .expect(res => {
          expect(res.body.message).toBe('Session not found');
        });
    });
  });
});
