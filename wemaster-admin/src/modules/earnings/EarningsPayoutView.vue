<template>
  <div class="earnings-payout-view">
    <h2>{{ $t('earnings.payouts.title') }}</h2>
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
      <el-table-column prop="id" :label="$t('earnings.payouts.id')" width="180" />
      <el-table-column prop="tutor" :label="$t('earnings.payouts.tutor')" width="150" />
      <el-table-column prop="settlementId" :label="$t('earnings.payouts.settlementId')" width="180" />
      <el-table-column prop="amount" :label="$t('earnings.payouts.amount')" width="120">
        <template #default="{ row }">
          ¥{{ row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('earnings.payouts.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="method" :label="$t('earnings.payouts.method')" width="150" />
      <el-table-column prop="requestedAt" :label="$t('earnings.payouts.requestedAt')" width="180" />
      <el-table-column prop="processedAt" :label="$t('earnings.payouts.processedAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewDetails(row)">
            {{ $t('common.view') }}
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="success"
            size="small"
            @click="handleProcess(row)"
          >
            {{ $t('earnings.payouts.actions.process') }}
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
  tutor: '',
  status: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'tutor',
    label: '导师',
    type: 'text',
    placeholder: '请输入导师名称'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '待处理', value: 'pending' },
      { label: '处理中', value: 'processing' },
      { label: '已支付', value: 'paid' },
      { label: '失败', value: 'failed' }
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
    processing: 'primary',
    paid: 'success',
    failed: 'danger'
  };
  return statusMap[status] || '';
};

const fetchPayouts = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    payouts.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `PAYOUT${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      tutor: `导师 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      settlementId: `SETTLE${Math.floor(Math.random() * 1000)}`,
      amount: Math.floor(Math.random() * 10000) + 1000,
      status: ['pending', 'processing', 'paid', 'failed'][Math.floor(Math.random() * 4)],
      method: ['银行转账', '支付宝', '微信支付'][Math.floor(Math.random() * 3)],
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

const handleViewDetails = (payout) => {
  console.log('View payout details:', payout);
};

const handleProcess = (payout) => {
  console.log('Process payout:', payout);
};

// Lifecycle
onMounted(() => {
  fetchPayouts({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.earnings-payout-view {
  padding: 20px;
}
</style>