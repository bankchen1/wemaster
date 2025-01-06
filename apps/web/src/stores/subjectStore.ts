import { create } from 'zustand';
import { Subject, TeachingLevel, TutorSubject } from '@wemaster/shared/types/subject';
import { api } from '../lib/api';

interface SubjectStore {
  subjects: Subject[];
  tutorSubjects: TutorSubject[];
  loading: boolean;
  error: string | null;
  fetchSubjects: (level?: TeachingLevel) => Promise<Subject[]>;
  fetchTutorSubjects: (tutorId: string) => Promise<void>;
  addTutorSubject: (tutorId: string, subject: Partial<TutorSubject>) => Promise<void>;
  updateTutorSubject: (tutorId: string, subjectId: string, subject: Partial<TutorSubject>) => Promise<void>;
  deleteTutorSubject: (tutorId: string, subjectId: string) => Promise<void>;
}

export const useSubjectStore = create<SubjectStore>((set, get) => ({
  subjects: [],
  tutorSubjects: [],
  loading: false,
  error: null,

  fetchSubjects: async (level?: TeachingLevel) => {
    set({ loading: true, error: null });
    try {
      const params = level ? { level } : {};
      const response = await api.get('/subjects', { params });
      set({ subjects: response.data });
      return response.data;
    } catch (error) {
      set({ error: '获取科目列表失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTutorSubjects: async (tutorId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/tutors/${tutorId}/subjects`);
      set({ tutorSubjects: response.data });
    } catch (error) {
      set({ error: '获取导师科目失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addTutorSubject: async (tutorId: string, subject: Partial<TutorSubject>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/tutors/${tutorId}/subjects`, subject);
      set(state => ({
        tutorSubjects: [...state.tutorSubjects, response.data]
      }));
    } catch (error) {
      set({ error: '添加科目失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTutorSubject: async (tutorId: string, subjectId: string, subject: Partial<TutorSubject>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/tutors/${tutorId}/subjects/${subjectId}`, subject);
      set(state => ({
        tutorSubjects: state.tutorSubjects.map(s =>
          s.id === subjectId ? { ...s, ...response.data } : s
        )
      }));
    } catch (error) {
      set({ error: '更新科目失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTutorSubject: async (tutorId: string, subjectId: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/tutors/${tutorId}/subjects/${subjectId}`);
      set(state => ({
        tutorSubjects: state.tutorSubjects.filter(s => s.id !== subjectId)
      }));
    } catch (error) {
      set({ error: '删除科目失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
