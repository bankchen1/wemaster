import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
}

interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  devtools(
    immer((set) => ({
      ...initialState,

      setNotifications: (notifications) =>
        set((state) => {
          state.notifications = notifications;
          state.unreadCount = notifications.filter((n) => !n.read).length;
        }),

      addNotification: (notification) =>
        set((state) => {
          const newNotification = {
            ...notification,
            id: crypto.randomUUID(),
            read: false,
            createdAt: new Date(),
          };
          state.notifications.unshift(newNotification);
          state.unreadCount += 1;
        }),

      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadCount -= 1;
          }
        }),

      markAllAsRead: () =>
        set((state) => {
          state.notifications.forEach((n) => {
            n.read = true;
          });
          state.unreadCount = 0;
        }),

      removeNotification: (id) =>
        set((state) => {
          const index = state.notifications.findIndex((n) => n.id === id);
          if (index !== -1) {
            const wasUnread = !state.notifications[index].read;
            state.notifications.splice(index, 1);
            if (wasUnread) {
              state.unreadCount -= 1;
            }
          }
        }),

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      reset: () => set(initialState),
    })),
  ),
);
