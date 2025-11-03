import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    roles: [],
    permissions: [],
    tenantId: null,
    isAuthenticated: false,
  }),

  getters: {
    isAdmin: (state) => state.roles.includes('ADMIN'),
    isTutor: (state) => state.roles.includes('TUTOR'),
    isStudent: (state) => state.roles.includes('STUDENT'),
    hasPermission: (state) => (permission) => state.permissions.includes(permission),
  },

  actions: {
    setUser(user) {
      this.currentUser = user;
      this.roles = user.roles || [];
      this.permissions = user.permissions || [];
      this.tenantId = user.tenantId;
      this.isAuthenticated = true;
    },

    setTenantId(tenantId) {
      this.tenantId = tenantId;
    },

    logout() {
      this.currentUser = null;
      this.roles = [];
      this.permissions = [];
      this.tenantId = null;
      this.isAuthenticated = false;
    },

    /**
     * 检查用户是否有指定的角色
     * @param {string|string[]} requiredRoles - 需要的角色，可以是单个角色或角色数组
     * @returns {boolean} 是否有权限
     */
    hasRole(requiredRoles) {
      if (!this.isAuthenticated) return false;
      
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      return roles.some(role => this.roles.includes(role));
    },

    /**
     * 检查用户是否有指定的权限
     * @param {string|string[]} requiredPermissions - 需要的权限，可以是单个权限或权限数组
     * @returns {boolean} 是否有权限
     */
    checkPermission(requiredPermissions) {
      if (!this.isAuthenticated) {
        console.log('用户未认证，权限检查失败');
        return false;
      }
      
      const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      console.log('检查权限:', permissions, '用户权限:', this.permissions);
      
      const result = permissions.some(permission => this.permissions.includes(permission));
      console.log('权限检查结果:', result);
      return result;
    }
  },
});