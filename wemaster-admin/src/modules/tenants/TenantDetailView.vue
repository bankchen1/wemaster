<template>
  <div class="tenant-detail-view">
    <h2>{{ $t('tenants.detail.title') }}</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('tenants.detail.tabs.branding')" name="branding">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('tenants.detail.fields.id')">
            {{ tenant.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.fields.name')">
            {{ tenant.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.fields.domain')">
            {{ tenant.domain }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.fields.status')">
            <el-tag :type="tenant.status === 'active' ? 'success' : 'danger'">
              {{ tenant.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.fields.createdAt')">
            {{ tenant.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.fields.updatedAt')">
            {{ tenant.updatedAt }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('tenants.detail.tabs.pricing')" name="pricing">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('tenants.detail.pricing.courseFee')">
            {{ tenant.pricing.courseFee }}%
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.pricing.subscriptionFee')">
            {{ tenant.pricing.subscriptionFee }}%
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.pricing.payoutFee')">
            ¥{{ tenant.pricing.payoutFee }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('tenants.detail.tabs.policies')" name="policies">
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="$t('tenants.detail.policies.refundPolicy')">
            {{ tenant.policies.refundPolicy }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.policies.privacyPolicy')">
            {{ tenant.policies.privacyPolicy }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tenants.detail.policies.termsOfService')">
            {{ tenant.policies.termsOfService }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('tenants.detail.tabs.featureFlags')" name="featureFlags">
        <el-button type="primary" @click="handleManageFeatureFlags">
          {{ $t('tenants.detail.actions.manageFeatureFlags') }}
        </el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import XTable from '@/components/shared/XTable.vue';

const route = useRoute();

// State
const activeTab = ref('branding');
const tenant = ref({
  id: 'TENANT001',
  name: 'WeMaster',
  domain: 'wemaster.com',
  status: 'active',
  createdAt: '2023-01-01 12:00:00',
  updatedAt: '2023-01-01 12:00:00',
  pricing: {
    courseFee: 5,
    subscriptionFee: 3,
    payoutFee: 2
  },
  policies: {
    refundPolicy: '7天无理由退款',
    privacyPolicy: '严格保护用户隐私',
    termsOfService: '遵守相关法律法规'
  }
});

// Methods
const handleManageFeatureFlags = () => {
  console.log('Manage feature flags for tenant:', tenant.value.id);
};

// Lifecycle
onMounted(() => {
  // In a real implementation, you would fetch the tenant details by ID
  console.log('Tenant ID:', route.params.id);
});
</script>

<style scoped>
.tenant-detail-view {
  padding: 20px;
}
</style>