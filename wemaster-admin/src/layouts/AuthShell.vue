<template>
  <div class="auth-shell">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="logo">WeMaster Admin</h1>
        <p class="subtitle">登录到管理后台</p>
      </div>
      
      <div class="auth-content">
        <router-view />
      </div>
      
      <div class="auth-footer">
        <p>&copy; {{ new Date().getFullYear() }} WeMaster. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// This component serves as a layout wrapper for authentication pages
// It provides a consistent look and feel for login, forgot password, etc.
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-body);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--bg-container);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-light);
  padding: 40px 30px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0 0 10px 0;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.auth-footer {
  text-align: center;
  margin-top: 30px;
}

.auth-footer p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}
</style>