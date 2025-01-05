import { rest } from 'msw';
import { API_BASE_URL } from '../../config';

export const handlers = [
  // Live Session API
  rest.post(`${API_BASE_URL}/live/sessions`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          session: {
            id: 'session-123',
            roomName: 'class_booking-123',
            status: 'created',
            tutorId: 'tutor-123',
            studentId: 'student-123',
          },
          tutorToken: 'tutor-token',
          studentToken: 'student-token',
        },
      }),
    );
  }),

  rest.post(`${API_BASE_URL}/live/sessions/:id/start`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          id: req.params.id,
          status: 'active',
          actualStartTime: new Date().toISOString(),
        },
      }),
    );
  }),

  rest.post(`${API_BASE_URL}/live/sessions/:id/end`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          id: req.params.id,
          status: 'completed',
          actualEndTime: new Date().toISOString(),
        },
      }),
    );
  }),

  // Payment API
  rest.post(`${API_BASE_URL}/payments/intents`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          clientSecret: 'pi_123_secret_456',
        },
      }),
    );
  }),

  rest.post(`${API_BASE_URL}/payments/refunds`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          id: 'refund-123',
          status: 'pending',
          amount: 10000,
        },
      }),
    );
  }),

  // Withdrawal API
  rest.post(`${API_BASE_URL}/withdrawals/accounts`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          stripeAccountId: 'acct_123',
          status: 'pending_verification',
        },
      }),
    );
  }),

  rest.post(`${API_BASE_URL}/withdrawals/accounts/links`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          url: 'https://connect.stripe.com/setup/s/xxxxx',
        },
      }),
    );
  }),

  rest.post(`${API_BASE_URL}/withdrawals`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          id: 'withdrawal-123',
          status: 'pending',
          amount: req.body.amount,
        },
      }),
    );
  }),

  rest.get(`${API_BASE_URL}/withdrawals/stats`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          totalEarnings: 100000,
          totalWithdrawn: 50000,
          balance: 50000,
          paymentsCount: 10,
          withdrawalsCount: 5,
        },
      }),
    );
  }),
];
