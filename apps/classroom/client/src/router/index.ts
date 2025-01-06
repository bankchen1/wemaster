import { createRouter, createWebHistory } from 'vue-router';
import ClassroomView from '@/views/ClassroomView.vue';
import ScheduleView from '@/views/ScheduleView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/schedule'
    },
    {
      path: '/classroom/:id',
      name: 'classroom',
      component: ClassroomView,
      props: true,
      children: [
        {
          path: 'whiteboard',
          name: 'whiteboard',
          component: () => import('@/views/WhiteboardView.vue')
        },
        {
          path: 'polls',
          name: 'polls',
          component: () => import('@/views/PollsView.vue')
        },
        {
          path: 'breakout-rooms',
          name: 'breakout-rooms',
          component: () => import('@/views/BreakoutRoomsView.vue')
        }
      ]
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: ScheduleView
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    }
  ]
});

export default router;
