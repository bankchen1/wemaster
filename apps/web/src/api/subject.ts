import { http } from '@/utils/http';
import { Subject, SubjectTreeNode } from '@/types/subject';

export const subjectApi = {
  // 获取科目树形结构
  getSubjectTree: () => {
    return http.get<SubjectTreeNode[]>('/api/subjects/tree');
  },

  // 获取科目详情
  getSubjectDetail: (id: string) => {
    return http.get<Subject>(\`/api/subjects/\${id}\`);
  },

  // 获取科目下的导师列表
  getSubjectTutors: (id: string) => {
    return http.get(\`/api/subjects/\${id}/tutors\`);
  },

  // 搜索科目
  searchSubjects: (query: string) => {
    return http.get<Subject[]>('/api/subjects/search', {
      params: { query }
    });
  },

  // 获取热门科目
  getPopularSubjects: () => {
    return http.get<Subject[]>('/api/subjects/popular');
  },

  // 获取推荐科目（基于用户兴趣）
  getRecommendedSubjects: () => {
    return http.get<Subject[]>('/api/subjects/recommended');
  },

  // 获取科目统计信息
  getSubjectStats: (id: string) => {
    return http.get(\`/api/subjects/\${id}/stats\`);
  }
};
