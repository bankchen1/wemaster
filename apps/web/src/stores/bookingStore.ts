import { create } from 'zustand';
import { api } from '../lib/api';
import {
  Booking,
  BookingStatus,
  TimeSlot,
  RescheduleRequest
} from '@wemaster/shared/types/booking';

interface BookingStore {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;

  // 学生相关操作
  createBooking: (data: {
    tutorId: string;
    courseId: string;
    timeSlotId: string;
  }) => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<void>;
  requestReschedule: (bookingId: string, data: {
    timeSlotId: string;
    reason: string;
  }) => Promise<void>;

  // 导师相关操作
  confirmBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string, reason: string) => Promise<void>;
  respondToReschedule: (requestId: string, approved: boolean, message?: string) => Promise<void>;
  setTimeSlots: (timeSlots: TimeSlot[]) => Promise<void>;

  // 通用操作
  fetchBookings: () => Promise<void>;
  fetchBookingById: (bookingId: string) => Promise<void>;
  fetchTimeSlots: (tutorId: string, startDate: Date, endDate: Date) => Promise<TimeSlot[]>;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,

  createBooking: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/bookings', data);
      set(state => ({
        bookings: [...state.bookings, response.data],
        currentBooking: response.data,
      }));
    } catch (error) {
      set({ error: '创建预约失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  cancelBooking: async (bookingId, reason) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
      
      set(state => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? response.data : booking
        ),
        currentBooking: response.data,
      }));
    } catch (error) {
      set({ error: '取消预约失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  requestReschedule: async (bookingId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/bookings/${bookingId}/reschedule`, data);
      
      set(state => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? response.data : booking
        ),
        currentBooking: response.data,
      }));
    } catch (error) {
      set({ error: '申请改期失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  confirmBooking: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/bookings/${bookingId}/confirm`);
      
      set(state => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? response.data : booking
        ),
        currentBooking: response.data,
      }));
    } catch (error) {
      set({ error: '确认预约失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectBooking: async (bookingId, reason) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/bookings/${bookingId}/reject`, { reason });
      
      set(state => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? response.data : booking
        ),
        currentBooking: response.data,
      }));
    } catch (error) {
      set({ error: '拒绝预约失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  respondToReschedule: async (requestId, approved, message) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/reschedule-requests/${requestId}/respond`, {
        approved,
        message,
      });
      
      // 更新相关预约状态
      if (response.data.booking) {
        set(state => ({
          bookings: state.bookings.map(booking =>
            booking.id === response.data.booking.id ? response.data.booking : booking
          ),
          currentBooking: response.data.booking,
        }));
      }
    } catch (error) {
      set({ error: '响应改期请求失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setTimeSlots: async (timeSlots) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/time-slots', { timeSlots });
      return response.data;
    } catch (error) {
      set({ error: '设置时间段失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/bookings');
      set({ bookings: response.data });
    } catch (error) {
      set({ error: '获取预约列表失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchBookingById: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      set({ currentBooking: response.data });
    } catch (error) {
      set({ error: '获取预约详情失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTimeSlots: async (tutorId, startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/time-slots', {
        params: {
          tutorId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data;
    } catch (error) {
      set({ error: '获取时间段失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
