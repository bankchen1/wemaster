import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '@/types/classroom';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 设置当前用户
  const setCurrentUser = (user: User | null) => {
    currentUser.value = user;
  };

  // 更新用户信息
  const updateUserInfo = (updates: Partial<User>) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updates };
    }
  };

  // 清除用户信息
  const clearCurrentUser = () => {
    currentUser.value = null;
  };

  return {
    currentUser,
    loading,
    error,
    setCurrentUser,
    updateUserInfo,
    clearCurrentUser
  };
});
