<template>
  <div class="wallet-payout-view">
    <h2>{{ $t('wallets.payouts.title') }}</h2>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="payouts"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('wallets.payouts.id')" width="180" />
      <el-table-column prop="user" :label="$t('wallets.payouts.user')" width="150" />
      <el-table-column prop="amount" :label="$t('wallets.payouts.amount')" width="120">
        <template #default="{ row }">
          ¥{{ row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('wallets.payouts.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="method" :label="$t('wallets.payouts.method')" width="150" />
      <el-table-column prop="requestedAt" :label="$t('wallets.payouts.requestedAt')" width="180" />
      <el-table-column prop="processedAt" :label="$t('wallets.payouts.processedAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending'"
            type="primary"
            size="small"
            @click="handleApprove(row)"
          >
            {{ $t('wallets.payouts.actions.approve') }}
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="warning"
            size="small"
            @click="handleReject(row)"
          >
            {{ $t('wallets.payouts.actions.reject') }}
          </el-button>
          <el-button
            v-if="row.status === 'approved'"
            type="success"
            size="small"
            @click="handleComplete(row)"
          >
            {{ $t('wallets.payouts.actions.complete') }}
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
const payouts = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  user: '',
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
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '待处理', value: 'pending' },
      { label: '已批准', value: 'approved' },
      { label: '已完成', value: 'completed' },
      { label: '已拒绝', value: 'rejected' }
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
    pending: 'warning',
    approved: 'primary',
    completed: 'success',
    rejected: 'danger'
  };
  return statusMap[status] || '';
};

const fetchPayouts = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    payouts.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `PAYOUT${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      user: `用户 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      amount: Math.floor(Math.random() * 10000) + 1000,
      status: ['pending', 'approved', 'completed', 'rejected'][Math.floor(Math.random() * 4)],
      method: ['银行卡', '支付宝', '微信支付'][Math.floor(Math.random() * 3)],
      requestedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch payouts:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchPayouts({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchPayouts({ ...filters.value, page, pageSize });
};

const handleApprove = (payout) => {
  console.log('Approve payout:', payout);
};

const handleReject = (payout) => {
  console.log('Reject payout:', payout);
};

const handleComplete = (payout) => {
  console.log('Complete payout:', payout);
};

// Lifecycle
onMounted(() => {
  fetchPayouts({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.wallet-payout-view {
  padding: 20px;
}
</style>