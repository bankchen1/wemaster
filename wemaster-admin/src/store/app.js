import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    tenantId: null,
    theme: 'light', // 'light' or 'dark'
    locale: 'zh-CN', // 'zh-CN' or 'en-US'
    sidebarCollapsed: false,
    device: 'desktop', // 'desktop' or 'mobile'
  }),

  getters: {
    isDarkTheme: (state) => state.theme === 'dark',
    isMobile: (state) => state.device === 'mobile',
  },

  actions: {
    setTenantId(tenantId) {
      this.tenantId = tenantId;
    },

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.theme);
    },

    setTheme(theme) {
      this.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed;
    },

    setDevice(device) {
      this.device = device;
    },

    setLocale(locale) {
      this.locale = locale;
    }
  },
});