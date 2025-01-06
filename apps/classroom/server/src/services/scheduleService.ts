import { v4 as uuidv4 } from 'uuid';
import { ClassSchedule, User } from '../types/classroom';

class ScheduleService {
  private schedules: Map<string, ClassSchedule>;

  constructor() {
    this.schedules = new Map();
  }

  // 创建课程安排
  createSchedule(scheduleData: Omit<ClassSchedule, 'id' | 'enrolledStudents' | 'waitlist' | 'status'>): ClassSchedule {
    const schedule: ClassSchedule = {
      id: uuidv4(),
      ...scheduleData,
      enrolledStudents: [],
      waitlist: [],
      status: 'scheduled'
    };

    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  // 获取课程安排
  getSchedule(scheduleId: string): ClassSchedule | undefined {
    return this.schedules.get(scheduleId);
  }

  // 获取教师的所有课程安排
  getTeacherSchedules(teacherId: string): ClassSchedule[] {
    return Array.from(this.schedules.values())
      .filter(schedule => schedule.teacher.id === teacherId);
  }

  // 获取学生的所有课程安排
  getStudentSchedules(studentId: string): ClassSchedule[] {
    return Array.from(this.schedules.values())
      .filter(schedule => 
        schedule.enrolledStudents.some(student => student.id === studentId) ||
        schedule.waitlist.some(student => student.id === studentId)
      );
  }

  // 学生报名课程
  enrollStudent(scheduleId: string, student: User): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    // 检查是否已经报名
    if (schedule.enrolledStudents.some(s => s.id === student.id)) {
      return false;
    }

    // 检查是否有名额限制
    if (schedule.maxStudents && schedule.enrolledStudents.length >= schedule.maxStudents) {
      // 加入等待列表
      if (!schedule.waitlist.some(s => s.id === student.id)) {
        schedule.waitlist.push(student);
      }
      return true;
    }

    schedule.enrolledStudents.push(student);
    return true;
  }

  // 学生退出课程
  unenrollStudent(scheduleId: string, studentId: string): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    // 从已报名列表中移除
    schedule.enrolledStudents = schedule.enrolledStudents.filter(s => s.id !== studentId);

    // 如果有等待列表且有名额限制，将等待列表中的第一个学生移到已报名列表
    if (schedule.waitlist.length > 0 && schedule.maxStudents && 
        schedule.enrolledStudents.length < schedule.maxStudents) {
      const nextStudent = schedule.waitlist.shift();
      if (nextStudent) {
        schedule.enrolledStudents.push(nextStudent);
      }
    }

    return true;
  }

  // 更新课程安排
  updateSchedule(scheduleId: string, updates: Partial<ClassSchedule>): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    Object.assign(schedule, updates);
    return true;
  }

  // 取消课程
  cancelSchedule(scheduleId: string): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    schedule.status = 'cancelled';
    return true;
  }

  // 完成课程
  completeSchedule(scheduleId: string): boolean {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return false;

    schedule.status = 'completed';
    return true;
  }

  // 获取时间段内的课程安排
  getSchedulesByTimeRange(startTime: Date, endTime: Date): ClassSchedule[] {
    return Array.from(this.schedules.values())
      .filter(schedule => 
        schedule.startTime >= startTime && schedule.endTime <= endTime
      );
  }

  // 获取可用课程列表（未开始且未满的课程）
  getAvailableSchedules(): ClassSchedule[] {
    const now = new Date();
    return Array.from(this.schedules.values())
      .filter(schedule => 
        schedule.status === 'scheduled' &&
        schedule.startTime > now &&
        (!schedule.maxStudents || schedule.enrolledStudents.length < schedule.maxStudents)
      );
  }

  // 处理周期性课程
  generateRecurringSchedules(baseSchedule: ClassSchedule, count: number): ClassSchedule[] {
    const schedules: ClassSchedule[] = [];
    let currentDate = new Date(baseSchedule.startTime);
    let currentEndDate = new Date(baseSchedule.endTime);

    for (let i = 0; i < count; i++) {
      const schedule = this.createSchedule({
        ...baseSchedule,
        startTime: new Date(currentDate),
        endTime: new Date(currentEndDate)
      });

      schedules.push(schedule);

      // 根据重复类型调整日期
      switch (baseSchedule.recurringType) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          currentEndDate.setDate(currentEndDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          currentEndDate.setDate(currentEndDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          currentEndDate.setMonth(currentEndDate.getMonth() + 1);
          break;
      }

      // 检查是否超过结束日期
      if (baseSchedule.recurringEndDate && currentDate > baseSchedule.recurringEndDate) {
        break;
      }
    }

    return schedules;
  }
}

export const scheduleService = new ScheduleService();
