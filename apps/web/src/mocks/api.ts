import { rest } from 'msw';
import {
  featuredTutors,
  popularCourses,
  testimonials,
  subjects,
  statistics,
} from './data';
import {
  ApiResponse,
  PaginatedResponse,
  Tutor,
  Course,
  Review,
  SearchFilters,
  SortOption,
} from '../types';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to paginate results
const paginate = <T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    pageSize,
    hasMore: end < items.length,
  };
};

export const handlers = [
  // Get featured tutors
  rest.get('/api/tutors/featured', async (req, res, ctx) => {
    await delay(500);
    const response: ApiResponse<Tutor[]> = {
      code: 200,
      message: 'Success',
      data: featuredTutors,
    };
    return res(ctx.json(response));
  }),

  // Search tutors with filters
  rest.get('/api/tutors/search', async (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 10;
    const subject = req.url.searchParams.get('subject');
    const minPrice = Number(req.url.searchParams.get('minPrice'));
    const maxPrice = Number(req.url.searchParams.get('maxPrice'));
    const rating = Number(req.url.searchParams.get('rating'));

    await delay(800);

    let filteredTutors = [...featuredTutors];

    // Apply filters
    if (subject) {
      filteredTutors = filteredTutors.filter(tutor =>
        tutor.subjects.some(s => s.id === subject)
      );
    }

    if (minPrice) {
      filteredTutors = filteredTutors.filter(tutor => tutor.hourlyRate >= minPrice);
    }

    if (maxPrice) {
      filteredTutors = filteredTutors.filter(tutor => tutor.hourlyRate <= maxPrice);
    }

    if (rating) {
      filteredTutors = filteredTutors.filter(tutor => tutor.rating >= rating);
    }

    const paginatedResults = paginate(filteredTutors, page, pageSize);

    const response: ApiResponse<PaginatedResponse<Tutor>> = {
      code: 200,
      message: 'Success',
      data: paginatedResults,
    };

    return res(ctx.json(response));
  }),

  // Get popular courses
  rest.get('/api/courses/popular', async (req, res, ctx) => {
    await delay(500);
    const response: ApiResponse<Course[]> = {
      code: 200,
      message: 'Success',
      data: popularCourses,
    };
    return res(ctx.json(response));
  }),

  // Get subjects
  rest.get('/api/subjects', async (req, res, ctx) => {
    await delay(300);
    const response: ApiResponse<typeof subjects> = {
      code: 200,
      message: 'Success',
      data: subjects,
    };
    return res(ctx.json(response));
  }),

  // Get testimonials
  rest.get('/api/testimonials', async (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const pageSize = Number(req.url.searchParams.get('pageSize')) || 10;

    await delay(500);

    const paginatedResults = paginate(testimonials, page, pageSize);

    const response: ApiResponse<PaginatedResponse<Review>> = {
      code: 200,
      message: 'Success',
      data: paginatedResults,
    };

    return res(ctx.json(response));
  }),

  // Get statistics
  rest.get('/api/statistics', async (req, res, ctx) => {
    await delay(300);
    const response: ApiResponse<typeof statistics> = {
      code: 200,
      message: 'Success',
      data: statistics,
    };
    return res(ctx.json(response));
  }),

  // Book a trial lesson
  rest.post('/api/bookings/trial', async (req, res, ctx) => {
    await delay(1000);
    const response: ApiResponse<{ bookingId: string }> = {
      code: 200,
      message: 'Trial lesson booked successfully',
      data: { bookingId: 'trial-' + Date.now() },
    };
    return res(ctx.json(response));
  }),

  // Send quick chat message
  rest.post('/api/messages/quick-chat', async (req, res, ctx) => {
    await delay(800);
    const response: ApiResponse<{ messageId: string }> = {
      code: 200,
      message: 'Message sent successfully',
      data: { messageId: 'msg-' + Date.now() },
    };
    return res(ctx.json(response));
  }),
];

// Setup MSW
export const setupMocks = () => {
  if (typeof window === 'undefined') {
    const { server } = require('./server');
    server.listen();
  } else {
    const { worker } = require('./browser');
    worker.start();
  }
};
