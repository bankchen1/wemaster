import { create } from 'zustand';
import { api } from '../lib/api';
import {
  Message,
  Conversation,
  MessageQuery,
  MessageType,
} from '@wemaster/shared/types/message';

interface MessageStore {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  error: string | null;
  currentConversation: Conversation | null;
  fetchConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (data: {
    conversationId: string;
    content: string;
    type: MessageType;
  }) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  createConversation: (participantIds: string[]) => Promise<string>;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  messages: [],
  loading: false,
  error: null,
  currentConversation: null,

  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/conversations');
      set({ conversations: response.data });
    } catch (error) {
      set({ error: '获取对话列表失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadMessages: async (conversationId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      set({ messages: response.data });
    } catch (error) {
      set({ error: '获取消息失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async ({ conversationId, content, type }) => {
    try {
      const response = await api.post(`/conversations/${conversationId}/messages`, {
        content,
        type,
      });
      
      set(state => ({
        messages: [...state.messages, response.data],
      }));

      // 更新会话列表中的最后一条消息
      set(state => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessage: response.data }
            : conv
        ),
      }));
    } catch (error) {
      set({ error: '发送消息失败' });
      throw error;
    }
  },

  markAsRead: async (conversationId: string) => {
    try {
      await api.post(`/conversations/${conversationId}/read`);
      
      // 更新未读消息计数
      set(state => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        ),
      }));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  },

  createConversation: async (participantIds: string[]) => {
    try {
      const response = await api.post('/conversations', {
        participants: participantIds,
      });
      
      set(state => ({
        conversations: [response.data, ...state.conversations],
      }));

      return response.data.id;
    } catch (error) {
      set({ error: '创建对话失败' });
      throw error;
    }
  },
}));
