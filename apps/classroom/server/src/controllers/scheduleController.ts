import { Request, Response } from 'express';
import { scheduleService } from '../services/scheduleService';
import { ClassSchedule } from '../types/classroom';

export const scheduleController = {
  // 创建课程安排
  createSchedule: async (req: Request, res: Response) => {
    try {
      const scheduleData = req.body;
      const schedule = scheduleService.createSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  },

  // 获取课程安排
  getSchedule: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const schedule = scheduleService.getSchedule(id);
      if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get schedule' });
    }
  },

  // 获取教师的课程安排
  getTeacherSchedules: async (req: Request, res: Response) => {
    try {
      const { teacherId } = req.params;
      const schedules = scheduleService.getTeacherSchedules(teacherId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get teacher schedules' });
    }
  },

  // 获取学生的课程安排
  getStudentSchedules: async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
      const schedules = scheduleService.getStudentSchedules(studentId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get student schedules' });
    }
  },

  // 报名课程
  enrollStudent: async (req: Request, res: Response) => {
    try {
      const { scheduleId } = req.params;
      const { student } = req.body;
      const success = scheduleService.enrollStudent(scheduleId, student);
      if (!success) {
        return res.status(400).json({ error: 'Failed to enroll student' });
      }
      res.json({ message: 'Student enrolled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to enroll student' });
    }
  },

  // 退出课程
  unenrollStudent: async (req: Request, res: Response) => {
    try {
      const { scheduleId, studentId } = req.params;
      const success = scheduleService.unenrollStudent(scheduleId, studentId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to unenroll student' });
      }
      res.json({ message: 'Student unenrolled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unenroll student' });
    }
  },

  // 更新课程安排
  updateSchedule: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const success = scheduleService.updateSchedule(id, updates);
      if (!success) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.json({ message: 'Schedule updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  },

  // 取消课程
  cancelSchedule: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = scheduleService.cancelSchedule(id);
      if (!success) {
        return res.status(404).json({ error: 'Schedule not found' });
      }
      res.json({ message: 'Schedule cancelled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel schedule' });
    }
  },

  // 获取时间段内的课程
  getSchedulesByTimeRange: async (req: Request, res: Response) => {
    try {
      const { startTime, endTime } = req.query;
      const schedules = scheduleService.getSchedulesByTimeRange(
        new Date(startTime as string),
        new Date(endTime as string)
      );
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get schedules by time range' });
    }
  },

  // 获取可用课程
  getAvailableSchedules: async (req: Request, res: Response) => {
    try {
      const schedules = scheduleService.getAvailableSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get available schedules' });
    }
  },

  // 创建周期性课程
  createRecurringSchedule: async (req: Request, res: Response) => {
    try {
      const { baseSchedule, count } = req.body;
      const schedules = scheduleService.generateRecurringSchedules(baseSchedule, count);
      res.status(201).json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create recurring schedules' });
    }
  }
};
