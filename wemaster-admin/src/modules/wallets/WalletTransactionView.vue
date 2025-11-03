<template>
  <div class="wallet-transaction-view">
    <h2>{{ $t('wallets.transactions.title') }}</h2>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="transactions"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('wallets.transactions.id')" width="180" />
      <el-table-column prop="user" :label="$t('wallets.transactions.user')" width="150" />
      <el-table-column prop="type" :label="$t('wallets.transactions.type')" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeColor(row.type)">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" :label="$t('wallets.transactions.amount')" width="120">
        <template #default="{ row }">
          <span :class="row.amount > 0 ? 'text-success' : 'text-danger'">
            {{ row.amount > 0 ? '+' : '' }}¥{{ row.amount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="balanceAfter" :label="$t('wallets.transactions.balanceAfter')" width="120">
        <template #default="{ row }">
          ¥{{ row.balanceAfter }}
        </template>
      </el-table-column>
      <el-table-column prop="source" :label="$t('wallets.transactions.source')" width="150" />
      <el-table-column prop="createdAt" :label="$t('wallets.transactions.createdAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewDetails(row)">
            {{ $t('common.view') }}
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
const transactions = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  user: '',
  type: '',
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
    key: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    options: [
      { label: '充值', value: 'deposit' },
      { label: '消费', value: 'purchase' },
      { label: '退款', value: 'refund' },
      { label: '提现', value: 'withdrawal' }
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
const getTypeColor = (type) => {
  const colorMap = {
    deposit: 'success',
    purchase: 'danger',
    refund: 'warning',
    withdrawal: 'info'
  };
  return colorMap[type] || '';
};

const fetchTransactions = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    transactions.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `TXN${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      user: `用户 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      type: ['deposit', 'purchase', 'refund', 'withdrawal'][Math.floor(Math.random() * 4)],
      amount: (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 1000) + 100),
      balanceAfter: Math.floor(Math.random() * 5000) + 1000,
      source: ['支付宝', '微信支付', '银行卡', '系统调整'][Math.floor(Math.random() * 4)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 10000; // Mock total
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchTransactions({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchTransactions({ ...filters.value, page, pageSize });
};

const handleViewDetails = (transaction) => {
  console.log('View transaction details:', transaction);
};

// Lifecycle
onMounted(() => {
  fetchTransactions({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.wallet-transaction-view {
  padding: 20px;
}

.text-success {
  color: var(--color-success);
}

.text-danger {
  color: var(--color-danger);
}
</style>