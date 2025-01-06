import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ClassSchedule, User } from '@/types/classroom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<ClassSchedule[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取所有课程安排
  const fetchSchedules = async () => {
    try {
      loading.value = true;
      const response = await axios.get(`${API_BASE_URL}/api/schedules`);
      schedules.value = response.data;
    } catch (err) {
      error.value = '获取课程安排失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 创建课程安排
  const createSchedule = async (scheduleData: Partial<ClassSchedule>) => {
    try {
      loading.value = true;
      const newSchedule: ClassSchedule = {
        id: uuidv4(),
        ...scheduleData,
        status: 'scheduled',
        enrolledStudents: [],
        waitlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ClassSchedule;

      const response = await axios.post(`${API_BASE_URL}/api/schedules`, newSchedule);
      schedules.value.push(response.data);
      return response.data;
    } catch (err) {
      error.value = '创建课程失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 更新课程安排
  const updateSchedule = async (scheduleId: string, updates: Partial<ClassSchedule>) => {
    try {
      loading.value = true;
      const response = await axios.put(`${API_BASE_URL}/api/schedules/${scheduleId}`, updates);
      const index = schedules.value.findIndex(s => s.id === scheduleId);
      if (index !== -1) {
        schedules.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = '更新课程失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 删除课程安排
  const deleteSchedule = async (scheduleId: string) => {
    try {
      loading.value = true;
      await axios.delete(`${API_BASE_URL}/api/schedules/${scheduleId}`);
      schedules.value = schedules.value.filter(s => s.id !== scheduleId);
    } catch (err) {
      error.value = '删除课程失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 报名课程
  const enrollCourse = async (scheduleId: string) => {
    try {
      loading.value = true;
      const response = await axios.post(`${API_BASE_URL}/api/schedules/${scheduleId}/enroll`);
      const index = schedules.value.findIndex(s => s.id === scheduleId);
      if (index !== -1) {
        schedules.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = '报名失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 取消报名
  const unenrollCourse = async (scheduleId: string) => {
    try {
      loading.value = true;
      const response = await axios.post(`${API_BASE_URL}/api/schedules/${scheduleId}/unenroll`);
      const index = schedules.value.findIndex(s => s.id === scheduleId);
      if (index !== -1) {
        schedules.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = '取消报名失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 取消课程
  const cancelSchedule = async (scheduleId: string) => {
    try {
      loading.value = true;
      const response = await axios.post(`${API_BASE_URL}/api/schedules/${scheduleId}/cancel`);
      const index = schedules.value.findIndex(s => s.id === scheduleId);
      if (index !== -1) {
        schedules.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = '取消课程失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 报名课程
  const enrollStudent = async (scheduleId: string, student: User) => {
    try {
      loading.value = true;
      const response = await axios.post(
        `${API_BASE_URL}/api/schedules/${scheduleId}/enroll`,
        { student }
      );
      const schedule = schedules.value.find(s => s.id === scheduleId);
      if (schedule) {
        schedule.enrolledStudents.push(student);
      }
      return response.data;
    } catch (err) {
      error.value = '报名课程失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 退出课程
  const unenrollStudent = async (scheduleId: string, studentId: string) => {
    try {
      loading.value = true;
      await axios.post(`${API_BASE_URL}/api/schedules/${scheduleId}/unenroll/${studentId}`);
      const schedule = schedules.value.find(s => s.id === scheduleId);
      if (schedule) {
        schedule.enrolledStudents = schedule.enrolledStudents.filter(s => s.id !== studentId);
      }
    } catch (err) {
      error.value = '退出课程失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 获取教师的课程安排
  const fetchTeacherSchedules = async (teacherId: string) => {
    try {
      loading.value = true;
      const response = await axios.get(`${API_BASE_URL}/api/schedules/teacher/${teacherId}`);
      return response.data;
    } catch (err) {
      error.value = '获取教师课程安排失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 获取学生的课程安排
  const fetchStudentSchedules = async (studentId: string) => {
    try {
      loading.value = true;
      const response = await axios.get(`${API_BASE_URL}/api/schedules/student/${studentId}`);
      return response.data;
    } catch (err) {
      error.value = '获取学生课程安排失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 获取可用课程
  const fetchAvailableSchedules = async () => {
    try {
      loading.value = true;
      const response = await axios.get(`${API_BASE_URL}/api/schedules/available`);
      return response.data;
    } catch (err) {
      error.value = '获取可用课程失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 创建周期性课程
  const createRecurringSchedule = async (
    baseSchedule: Partial<ClassSchedule>,
    count: number
  ) => {
    try {
      loading.value = true;
      const response = await axios.post(`${API_BASE_URL}/api/schedules/recurring`, {
        baseSchedule,
        count
      });
      schedules.value.push(...response.data);
      return response.data;
    } catch (err) {
      error.value = '创建周期性课程失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    enrollCourse,
    unenrollCourse,
    cancelSchedule,
    enrollStudent,
    unenrollStudent,
    fetchTeacherSchedules,
    fetchStudentSchedules,
    fetchAvailableSchedules,
    createRecurringSchedule
  };
});
