import { request } from '@/utils/request';

export const messageApi = {
  // 发送快速咨询
  sendQuickChat: (data) => {
    return request.post('/api/messages/quick-chat', data);
  },

  // 获取消息列表
  getMessages: (params) => {
    return request.get('/api/messages', { params });
  },

  // 获取未读消息数
  getUnreadCount: () => {
    return request.get('/api/messages/unread-count');
  },

  // 标记消息为已读
  markAsRead: (messageId: string) => {
    return request.put(\`/api/messages/\${messageId}/read\`);
  },

  // 标记所有消息为已读
  markAllAsRead: () => {
    return request.put('/api/messages/read-all');
  },

  // 删除消息
  deleteMessage: (messageId: string) => {
    return request.delete(\`/api/messages/\${messageId}\`);
  },

  // 获取聊天历史
  getChatHistory: (tutorId: string, params) => {
    return request.get(\`/api/messages/chat-history/\${tutorId}\`, { params });
  }
};
