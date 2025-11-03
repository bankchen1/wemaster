<template>
  <div class="user-detail-view">
    <h2>{{ $t('users.detail.title') }}</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('users.detail.tabs.profile')" name="profile">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('users.detail.fields.id')">
            {{ user.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('users.detail.fields.name')">
            {{ user.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('users.detail.fields.email')">
            {{ user.email }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('users.detail.fields.role')">
            {{ user.role }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('users.detail.fields.status')">
            <el-tag :type="user.status === 'active' ? 'success' : 'danger'">
              {{ user.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('users.detail.fields.tenant')">
            {{ user.tenant }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('users.detail.fields.createdAt')">
            {{ user.createdAt }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('users.detail.tabs.security')" name="security">
        <el-button type="primary" @click="handleResetPassword">
          {{ $t('users.detail.actions.resetPassword') }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane :label="$t('users.detail.tabs.kyc')" name="kyc">
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="$t('users.detail.kyc.status')">
            <el-tag>已验证</el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('users.detail.kyc.documentType')">
            身份证
          </el-descriptions-item>
          <el-descriptions-item :label="$t('users.detail.kyc.documentNumber')">
            123456789012345678
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('users.detail.tabs.devices')" name="devices">
        <x-table
          :data="devices"
          :loading="loading"
        >
          <el-table-column prop="id" :label="$t('users.detail.devices.id')" width="180" />
          <el-table-column prop="deviceType" :label="$t('users.detail.devices.type')" width="120" />
          <el-table-column prop="ipAddress" :label="$t('users.detail.devices.ip')" width="150" />
          <el-table-column prop="lastActive" :label="$t('users.detail.devices.lastActive')" width="180" />
          <el-table-column prop="location" :label="$t('users.detail.devices.location')" />
        </x-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('users.detail.tabs.audit')" name="audit">
        <x-table
          :data="auditLogs"
          :loading="loading"
        >
          <el-table-column prop="id" :label="$t('users.detail.audit.id')" width="180" />
          <el-table-column prop="action" :label="$t('users.detail.audit.action')" width="150" />
          <el-table-column prop="timestamp" :label="$t('users.detail.audit.timestamp')" width="180" />
          <el-table-column prop="ipAddress" :label="$t('users.detail.audit.ip')" width="150" />
        </x-table>
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
const activeTab = ref('profile');
const user = ref({
  id: 'USER001',
  name: '张三',
  email: 'zhangsan@example.com',
  role: '管理员',
  status: 'active',
  tenant: 'wemaster',
  createdAt: '2023-01-01 12:00:00'
});
const devices = ref([]);
const auditLogs = ref([]);
const loading = ref(false);

// Methods
const handleResetPassword = () => {
  console.log('Reset password for user:', user.value.id);
};

const fetchDevices = async () => {
  // Mock data
  devices.value = [
    {
      id: 'DEVICE001',
      deviceType: 'Chrome (Windows)',
      ipAddress: '192.168.1.100',
      lastActive: '2023-01-01 12:00:00',
      location: '北京'
    }
  ];
};

const fetchAuditLogs = async () => {
  // Mock data
  auditLogs.value = [
    {
      id: 'AUDIT001',
      action: '登录',
      timestamp: '2023-01-01 12:00:00',
      ipAddress: '192.168.1.100'
    }
  ];
};

// Lifecycle
onMounted(() => {
  fetchDevices();
  fetchAuditLogs();
});
</script>

<style scoped>
.user-detail-view {
  padding: 20px;
}
</style>