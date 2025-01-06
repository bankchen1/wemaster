import { create } from 'zustand';
import { api } from '../lib/api';
import {
  Appeal,
  AppealStatus,
  AppealEvidence,
} from '@wemaster/shared/types/booking';

interface AppealStore {
  appeals: Appeal[];
  currentAppeal: Appeal | null;
  loading: boolean;
  error: string | null;

  // 学生相关操作
  createAppeal: (bookingId: string, data: {
    reason: string;
    content: string;
    evidence?: File[];
  }) => Promise<void>;
  confirmTutorResponse: (appealId: string, accept: boolean) => Promise<void>;
  
  // 导师相关操作
  respondToAppeal: (appealId: string, response: string) => Promise<void>;
  
  // 通用操作
  fetchAppeals: () => Promise<void>;
  fetchAppealById: (appealId: string) => Promise<void>;
  uploadEvidence: (appealId: string, files: File[]) => Promise<void>;
  
  // 平台操作（仅管理员）
  processPlatformIntervention: (appealId: string, data: {
    response: string;
    refundAmount: number;
  }) => Promise<void>;
}

export const useAppealStore = create<AppealStore>((set, get) => ({
  appeals: [],
  currentAppeal: null,
  loading: false,
  error: null,

  createAppeal: async (bookingId, data) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('reason', data.reason);
      formData.append('content', data.content);
      
      if (data.evidence) {
        data.evidence.forEach(file => {
          formData.append('evidence', file);
        });
      }

      const response = await api.post(`/bookings/${bookingId}/appeals`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      set(state => ({
        appeals: [...state.appeals, response.data],
        currentAppeal: response.data,
      }));
    } catch (error) {
      set({ error: '创建申诉失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  confirmTutorResponse: async (appealId, accept) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/appeals/${appealId}/confirm`, { accept });
      
      set(state => ({
        appeals: state.appeals.map(appeal =>
          appeal.id === appealId ? response.data : appeal
        ),
        currentAppeal: response.data,
      }));
    } catch (error) {
      set({ error: '确认回复失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  respondToAppeal: async (appealId, response) => {
    set({ loading: true, error: null });
    try {
      const apiResponse = await api.post(`/appeals/${appealId}/respond`, { response });
      
      set(state => ({
        appeals: state.appeals.map(appeal =>
          appeal.id === appealId ? apiResponse.data : appeal
        ),
        currentAppeal: apiResponse.data,
      }));
    } catch (error) {
      set({ error: '回复申诉失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchAppeals: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/appeals');
      set({ appeals: response.data });
    } catch (error) {
      set({ error: '获取申诉列表失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchAppealById: async (appealId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/appeals/${appealId}`);
      set({ currentAppeal: response.data });
    } catch (error) {
      set({ error: '获取申诉详情失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  uploadEvidence: async (appealId, files) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('evidence', file);
      });

      const response = await api.post(`/appeals/${appealId}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      set(state => {
        const currentAppeal = state.currentAppeal;
        if (currentAppeal && currentAppeal.id === appealId) {
          return {
            currentAppeal: {
              ...currentAppeal,
              evidence: [...(currentAppeal.evidence || []), ...response.data],
            },
          };
        }
        return state;
      });
    } catch (error) {
      set({ error: '上传证据失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  processPlatformIntervention: async (appealId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/appeals/${appealId}/platform-process`, data);
      
      set(state => ({
        appeals: state.appeals.map(appeal =>
          appeal.id === appealId ? response.data : appeal
        ),
        currentAppeal: response.data,
      }));
    } catch (error) {
      set({ error: '处理平台干预失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
