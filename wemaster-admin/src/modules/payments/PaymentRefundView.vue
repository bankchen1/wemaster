<template>
  <div class="payment-refund-view">
    <h2>{{ $t('payments.refunds.title') }}</h2>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="refunds"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('payments.refunds.id')" width="180" />
      <el-table-column prop="orderId" :label="$t('payments.refunds.orderId')" width="180" />
      <el-table-column prop="amount" :label="$t('payments.refunds.amount')" width="120">
        <template #default="{ row }">
          ¥{{ row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="reason" :label="$t('payments.refunds.reason')" />
      <el-table-column prop="status" :label="$t('payments.refunds.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="requestedBy" :label="$t('payments.refunds.requestedBy')" width="120" />
      <el-table-column prop="createdAt" :label="$t('payments.refunds.createdAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'requested'"
            type="primary"
            size="small"
            @click="handleApprove(row)"
          >
            {{ $t('payments.refunds.actions.approve') }}
          </el-button>
          <el-button
            v-if="row.status === 'requested'"
            type="warning"
            size="small"
            @click="handleReject(row)"
          >
            {{ $t('payments.refunds.actions.reject') }}
          </el-button>
          <el-button
            v-if="row.status === 'approved'"
            type="success"
            size="small"
            @click="handleComplete(row)"
          >
            {{ $t('payments.refunds.actions.complete') }}
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
const refunds = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  orderId: '',
  status: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'orderId',
    label: '订单ID',
    type: 'text',
    placeholder: '请输入订单ID'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '已申请', value: 'requested' },
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
    requested: 'warning',
    approved: 'primary',
    completed: 'success',
    rejected: 'danger'
  };
  return statusMap[status] || '';
};

const fetchRefunds = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    refunds.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `REFUND${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      orderId: `ORDER${Math.floor(Math.random() * 1000)}`,
      amount: Math.floor(Math.random() * 1000) + 100,
      reason: `退款原因 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      status: ['requested', 'approved', 'completed', 'rejected'][Math.floor(Math.random() * 4)],
      requestedBy: `用户${Math.floor(Math.random() * 100)}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch refunds:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchRefunds({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchRefunds({ ...filters.value, page, pageSize });
};

const handleApprove = (refund) => {
  console.log('Approve refund:', refund);
};

const handleReject = (refund) => {
  console.log('Reject refund:', refund);
};

const handleComplete = (refund) => {
  console.log('Complete refund:', refund);
};

// Lifecycle
onMounted(() => {
  fetchRefunds({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.payment-refund-view {
  padding: 20px;
}
</style>