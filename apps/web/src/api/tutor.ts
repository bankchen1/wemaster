import { request } from '@/utils/request';

export const tutorApi = {
  // 搜索导师
  search: (params) => {
    return request.get('/api/tutors/search', { params });
  },

  // 获取导师详情
  getDetail: (id: string) => {
    return request.get(\`/api/tutors/\${id}\`);
  },

  // 获取导师日程
  getTutorSchedule: (tutorId: string) => {
    return request.get(\`/api/tutors/\${tutorId}/schedule\`);
  },

  // 获取试听时段
  getTrialSlots: (tutorId: string, date: string) => {
    return request.get(\`/api/tutors/\${tutorId}/trial-slots\`, {
      params: { date }
    });
  },

  // 关注导师
  follow: (tutorId: string) => {
    return request.post(\`/api/tutors/\${tutorId}/follow\`);
  },

  // 取消关注
  unfollow: (tutorId: string) => {
    return request.delete(\`/api/tutors/\${tutorId}/follow\`);
  },

  // 获取关注状态
  getFollowStatus: (tutorId: string) => {
    return request.get(\`/api/tutors/\${tutorId}/follow\`);
  },

  // 获取导师评价
  getReviews: (tutorId: string, params) => {
    return request.get(\`/api/tutors/\${tutorId}/reviews\`, { params });
  },

  // 获取导师统计信息
  getStats: (tutorId: string) => {
    return request.get(\`/api/tutors/\${tutorId}/stats\`);
  }
};
