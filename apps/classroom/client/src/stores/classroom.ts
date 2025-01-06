import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Classroom, User, ChatMessage, WhiteboardData, Poll, BreakoutRoom } from '@/types/classroom';

export const useClassroomStore = defineStore('classroom', () => {
  // 状态
  const currentClassroom = ref<Classroom | null>(null);
  const currentUser = ref<User | null>(null);
  const participants = ref<User[]>([]);
  const chatMessages = ref<ChatMessage[]>([]);
  const whiteboards = ref<WhiteboardData[]>([]);
  const activePolls = ref<Poll[]>([]);
  const breakoutRooms = ref<BreakoutRoom[]>([]);
  const isConnected = ref(false);

  // 计算属性
  const isTeacher = computed(() => currentUser.value?.role === 'teacher');
  const isStudent = computed(() => currentUser.value?.role === 'student');
  const isAssistant = computed(() => currentUser.value?.role === 'assistant');
  const canModerate = computed(() => isTeacher.value || isAssistant.value);
  const currentWhiteboard = computed(() => whiteboards.value[0] || null);

  // 方法
  const joinClassroom = async (classroomId: string, user: User) => {
    // TODO: 实现加入教室逻辑
  };

  const leaveClassroom = async () => {
    // TODO: 实现离开教室逻辑
  };

  const sendChatMessage = async (content: string, type: 'text' | 'file' | 'image' = 'text') => {
    // TODO: 实现发送消息逻辑
  };

  const createPoll = async (question: string, options: string[]) => {
    // TODO: 实现创建投票逻辑
  };

  const createBreakoutRoom = async (name: string, participants: User[]) => {
    // TODO: 实现创建分组讨论室逻辑
  };

  const toggleAudio = async (enabled: boolean) => {
    // TODO: 实现音频控制逻辑
  };

  const toggleVideo = async (enabled: boolean) => {
    // TODO: 实现视频控制逻辑
  };

  const startScreenShare = async () => {
    // TODO: 实现屏幕共享逻辑
  };

  const stopScreenShare = async () => {
    // TODO: 实现停止屏幕共享逻辑
  };

  const raiseHand = async () => {
    // TODO: 实现举手逻辑
  };

  const startRecording = async () => {
    // TODO: 实现录制逻辑
  };

  const stopRecording = async () => {
    // TODO: 实现停止录制逻辑
  };

  return {
    // 状态
    currentClassroom,
    currentUser,
    participants,
    chatMessages,
    whiteboards,
    activePolls,
    breakoutRooms,
    isConnected,

    // 计算属性
    isTeacher,
    isStudent,
    isAssistant,
    canModerate,
    currentWhiteboard,

    // 方法
    joinClassroom,
    leaveClassroom,
    sendChatMessage,
    createPoll,
    createBreakoutRoom,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    raiseHand,
    startRecording,
    stopRecording,
  };
});
