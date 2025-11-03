// 调试脚本 - 检查用户权限状态
console.log('=== 用户权限状态检查 ===');

// 检查Pinia store
const piniaStores = window.__PINIA_STORES__;
console.log('Pinia stores:', piniaStores);

// 检查用户store
if (piniaStores && piniaStores.user) {
  const userStore = piniaStores.user;
  console.log('用户store状态:', userStore);
  console.log('是否已认证:', userStore.isAuthenticated);
  console.log('用户角色:', userStore.roles);
  console.log('用户权限:', userStore.permissions);
  
  // 检查特定权限
  const requiredPermissions = [
    'tutors.view',
    'students.view',
    'courses.view',
    'sessions.view',
    'orders.view',
    'payments.view'
  ];
  
  requiredPermissions.forEach(permission => {
    const hasPermission = userStore.permissions.includes(permission);
    console.log(`权限 ${permission}: ${hasPermission ? '✓' : '✗'}`);
  });
} else {
  console.log('未找到用户store');
}

// 检查路由
console.log('当前路由:', window.location.pathname);

// 检查路由实例
if (window.router) {
  console.log('路由实例:', window.router);
}