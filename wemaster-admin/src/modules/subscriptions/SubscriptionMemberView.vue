<template>
  <div class="subscription-member-view">
    <h2>{{ $t('subscriptions.members.title') }}</h2>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="members"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('subscriptions.members.id')" width="180" />
      <el-table-column prop="user" :label="$t('subscriptions.members.user')" width="150" />
      <el-table-column prop="plan" :label="$t('subscriptions.members.plan')" width="150" />
      <el-table-column prop="status" :label="$t('subscriptions.members.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" :label="$t('subscriptions.members.startDate')" width="180" />
      <el-table-column prop="expiryDate" :label="$t('subscriptions.members.expiryDate')" width="180" />
      <el-table-column prop="paymentMethod" :label="$t('subscriptions.members.paymentMethod')" width="150" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewDetails(row)">
            {{ $t('common.view') }}
          </el-button>
          <el-button
            v-if="row.status === 'active'"
            type="warning"
            size="small"
            @click="handleCancel(row)"
          >
            {{ $t('subscriptions.members.actions.cancel') }}
          </el-button>
        </template>
      </el-table-column>
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XTable from '@/components/shared/XTable.vue';
import XFilter from '@/components/shared/XFilter.vue';

// State
const members = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  user: '',
  plan: '',
  status: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'user',
    label: '用户',
    type: 'text',
    placeholder: '请输入用户名称'
  },
  {
    key: 'plan',
    label: '订阅计划',
    type: 'select',
    placeholder: '请选择订阅计划',
    options: [
      { label: '基础版', value: 'basic' },
      { label: '高级版', value: 'premium' },
      { label: '专业版', value: 'professional' }
    ]
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '活跃', value: 'active' },
      { label: '已取消', value: 'cancelled' },
      { label: '已过期', value: 'expired' }
    ]
  },
  {
    key: 'dateRange',
    label: '时间范围',
    type: 'dateRange',
    placeholder: '请选择时间范围'
  }
]);

// Methods
const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    cancelled: 'warning',
    expired: 'danger'
  };
  return statusMap[status] || '';
};

const fetchMembers = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    members.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `MEMBER${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      user: `用户 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      plan: ['基础版', '高级版', '专业版'][Math.floor(Math.random() * 3)],
      status: ['active', 'cancelled', 'expired'][Math.floor(Math.random() * 3)],
      startDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: ['信用卡', '支付宝', '微信支付'][Math.floor(Math.random() * 3)]
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch members:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchMembers({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchMembers({ ...filters.value, page, pageSize });
};

const handleViewDetails = (member) => {
  console.log('View member details:', member);
};

const handleCancel = (member) => {
  console.log('Cancel subscription for member:', member);
};

// Lifecycle
onMounted(() => {
  fetchMembers({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.subscription-member-view {
  padding: 20px;
}
</style>