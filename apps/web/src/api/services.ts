import { request } from './client';
import {
  Tutor,
  Course,
  Review,
  SearchFilters,
  SortOption,
  PaginatedResponse,
  Booking,
  Message,
} from '../types';

export const tutorApi = {
  getFeatured: () => {
    return request<Tutor[]>({
      method: 'GET',
      url: '/tutors/featured',
    });
  },

  search: (filters: SearchFilters, sort: SortOption, page = 1, pageSize = 10) => {
    return request<PaginatedResponse<Tutor>>({
      method: 'GET',
      url: '/tutors/search',
      params: {
        ...filters,
        sortBy: sort.field,
        sortOrder: sort.order,
        page,
        pageSize,
      },
    });
  },

  getDetail: (id: string) => {
    return request<Tutor>({
      method: 'GET',
      url: `/tutors/${id}`,
    });
  },
};

export const courseApi = {
  getPopular: () => {
    return request<Course[]>({
      method: 'GET',
      url: '/courses/popular',
    });
  },

  search: (filters: any, page = 1, pageSize = 10) => {
    return request<PaginatedResponse<Course>>({
      method: 'GET',
      url: '/courses/search',
      params: { ...filters, page, pageSize },
    });
  },

  getDetail: (id: string) => {
    return request<Course>({
      method: 'GET',
      url: `/courses/${id}`,
    });
  },
};

export const bookingApi = {
  createTrial: (data: any) => {
    return request<Booking>({
      method: 'POST',
      url: '/bookings/trial',
      data,
    });
  },

  getUpcoming: (page = 1, pageSize = 10) => {
    return request<PaginatedResponse<Booking>>({
      method: 'GET',
      url: '/bookings/upcoming',
      params: { page, pageSize },
    });
  },
};

export const messageApi = {
  sendQuickChat: (data: any) => {
    return request<Message>({
      method: 'POST',
      url: '/messages/quick-chat',
      data,
    });
  },

  getConversation: (tutorId: string, page = 1, pageSize = 20) => {
    return request<PaginatedResponse<Message>>({
      method: 'GET',
      url: `/messages/conversation/${tutorId}`,
      params: { page, pageSize },
    });
  },
};

export const reviewApi = {
  getTestimonials: (page = 1, pageSize = 10) => {
    return request<PaginatedResponse<Review>>({
      method: 'GET',
      url: '/testimonials',
      params: { page, pageSize },
    });
  },

  create: (data: any) => {
    return request<Review>({
      method: 'POST',
      url: '/reviews',
      data,
    });
  },
};

export const statisticsApi = {
  getOverview: () => {
    return request<any>({
      method: 'GET',
      url: '/statistics',
    });
  },
};
