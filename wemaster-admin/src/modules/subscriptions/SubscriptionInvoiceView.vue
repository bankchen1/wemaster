<template>
  <div class="subscription-invoice-view">
    <h2>{{ $t('subscriptions.invoices.title') }}</h2>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="invoices"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('subscriptions.invoices.id')" width="180" />
      <el-table-column prop="member" :label="$t('subscriptions.invoices.member')" width="150" />
      <el-table-column prop="plan" :label="$t('subscriptions.invoices.plan')" width="150" />
      <el-table-column prop="amount" :label="$t('subscriptions.invoices.amount')" width="120">
        <template #default="{ row }">
          ¥{{ row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('subscriptions.invoices.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="issueDate" :label="$t('subscriptions.invoices.issueDate')" width="180" />
      <el-table-column prop="dueDate" :label="$t('subscriptions.invoices.dueDate')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewInvoice(row)">
            {{ $t('subscriptions.invoices.actions.view') }}
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="success"
            size="small"
            @click="handleMarkPaid(row)"
          >
            {{ $t('subscriptions.invoices.actions.markPaid') }}
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
const invoices = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  member: '',
  plan: '',
  status: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'member',
    label: '会员',
    type: 'text',
    placeholder: '请输入会员名称'
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
      { label: '待支付', value: 'pending' },
      { label: '已支付', value: 'paid' },
      { label: '已逾期', value: 'overdue' },
      { label: '已取消', value: 'cancelled' }
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
    paid: 'success',
    overdue: 'danger',
    cancelled: 'info'
  };
  return statusMap[status] || '';
};

const fetchInvoices = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    invoices.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `INV${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      member: `会员 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      plan: ['基础版', '高级版', '专业版'][Math.floor(Math.random() * 3)],
      amount: Math.floor(Math.random() * 1000) + 100,
      status: ['pending', 'paid', 'overdue', 'cancelled'][Math.floor(Math.random() * 4)],
      issueDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchInvoices({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchInvoices({ ...filters.value, page, pageSize });
};

const handleViewInvoice = (invoice) => {
  console.log('View invoice:', invoice);
};

const handleMarkPaid = (invoice) => {
  console.log('Mark invoice as paid:', invoice);
};

// Lifecycle
onMounted(() => {
  fetchInvoices({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.subscription-invoice-view {
  padding: 20px;
}
</style>