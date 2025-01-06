import { http } from '@/utils/http';
import { LessonStatus } from '@wemaster/shared/types/lesson-status';

export const courseApi = {
  // 获取课程信息
  getCourse: (id: string) => {
    return http.get(\`/api/courses/\${id}\`);
  },

  // 获取课程状态
  getCourseStatus: (id: string) => {
    return http.get(\`/api/courses/\${id}/status\`);
  },

  // 更新课程状态
  updateCourseStatus: (id: string, data: { status: LessonStatus; reason?: string }) => {
    return http.put(\`/api/courses/\${id}/status\`, data);
  },

  // 提交课程评价
  submitFeedback: (id: string, data: { rating: number; comment?: string }) => {
    return http.post(\`/api/courses/\${id}/feedback\`, data);
  },

  // 提交申诉
  submitAppeal: (id: string, data: { reason: string }) => {
    return http.post(\`/api/courses/\${id}/appeal\`, data);
  },

  // 重新安排课程
  rescheduleCourse: (
    id: string,
    data: { startTime: Date; endTime: Date; reason?: string }
  ) => {
    return http.put(\`/api/courses/\${id}/reschedule\`, data);
  },

  // 获取导师课程列表
  getTutorCourses: (tutorId: string) => {
    return http.get(\`/api/courses/tutor/\${tutorId}\`);
  },

  // 获取学生课程列表
  getStudentCourses: (studentId: string) => {
    return http.get(\`/api/courses/student/\${studentId}\`);
  },

  // 创建课程
  createCourse: (tutorId: string, data: any) => {
    return http.post(\`/api/courses/\${tutorId}\`, data);
  },

  // 更新课程信息
  updateCourse: (id: string, data: any) => {
    return http.put(\`/api/courses/\${id}\`, data);
  },

  // 上传课程材料
  uploadMaterial: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post(\`/api/courses/\${id}/materials\`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 删除课程材料
  removeMaterial: (id: string, materialUrl: string) => {
    return http.delete(\`/api/courses/\${id}/materials\`, {
      data: { url: materialUrl },
    });
  },

  // 获取课程统计信息
  getCourseStats: (id: string) => {
    return http.get(\`/api/courses/\${id}/stats\`);
  },
};
