<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'

// 导入全局样式
import '@/styles/tokens.css'
import '@/styles/theme.css'

// 初始化用户信息
const userStore = useUserStore()

onMounted(() => {
  // 模拟用户登录状态，实际项目中应从API获取用户信息
  if (!userStore.isAuthenticated) {
    userStore.setUser({
      id: 'user-1',
      name: 'Admin User',
      email: 'admin@wemaster.com',
      roles: ['ADMIN'],
      permissions: [
        'dashboard.view',
        'users.view', 'users.write', 'users.kyc', 'users.role.assign',
        'tutors.view', 'tutors.write', 'tutors.review', 'tutors.schedule', 'tutors.courses', 'earnings.view',
        'students.view', 'students.write', 'students.adjust', 'wallet.write', 'vip.write',
        'courses.view', 'courses.write', 'offerings.view', 'offerings.write',
        'sessions.view', 'sessions.write', 'sessions.attendance', 'sessions.refund.request',
        'orders.view', 'orders.write', 'refunds.write',
        'payments.view', 'payments.write', 'payments.retry', 'reconciliation.view',
        'subscriptions.view', 'subscriptions.write', 'subscriptions.plan.write', 'subscriptions.member.write',
        'wallets.view', 'wallets.write', 'wallets.read', 'wallets.adjust', 'wallets.payouts',
        'earnings.view', 'earnings.write', 'earnings.settle', 'earnings.payout',
        'messages.view', 'messages.write', 'messages.moderate', 'users.blacklist',
        'content.view', 'content.write', 'content.publish',
        'marketing.view', 'marketing.write', 'marketing.coupon', 'marketing.campaign', 'marketing.abtest',
        'analytics.view',
        'moderation.view', 'moderation.write', 'risk.rule', 'risk.enforce',
        'tenants.view', 'tenants.write', 'tenants.admin',
        'integrations.view', 'integrations.write', 'integrations.admin',
        'ops.view', 'ops.write', 'ops.cache', 'ops.queue', 'ops.scheduler', 'ops.health',
        'settings.view', 'settings.write', 'settings.admin',
        'audit.view'
      ],
      tenantId: 'wemaster'
    })
  }
})
</script>

<template>
  <RouterView />
</template>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-body);
  color: var(--text-primary);
}

#app {
  min-height: 100vh;
}
</style>
