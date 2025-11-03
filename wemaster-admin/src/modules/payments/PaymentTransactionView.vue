<template>
  <div class="payment-transaction">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="transactions"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="交易ID" width="180" sortable="custom" />
      <el-table-column prop="piId" label="Payment Intent ID" width="180" sortable="custom" />
      <el-table-column prop="csId" label="Charge ID" width="180" sortable="custom" />
      <el-table-column prop="amount" label="金额" width="120" sortable="custom" />
      <el-table-column prop="status" label="状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="failureReason" label="失败原因" width="150" sortable="custom" />
      <el-table-column prop="retryCount" label="重试次数" width="100" sortable="custom" />
      <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleRetry(row)">
            重试
          </el-button>
          <el-button type="warning" size="small" @click="handleWebhookReplay(row)">
            重放Webhook
          </el-button>
        </template>
      </el-table-column>
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XFilter from '@/components/shared/XFilter.vue';
import XTable from '@/components/shared/XTable.vue';

// State
const transactions = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

const filterModel = ref({});
const filterFields = ref([
  {
    key: 'keyword',
    label: '关键词',
    type: 'text',
    placeholder: '请输入交易ID或Payment Intent ID'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '成功', value: 'SUCCEEDED' },
      { label: '失败', value: 'FAILED' },
      { label: '处理中', value: 'PROCESSING' },
      { label: '已取消', value: 'CANCELED' }
    ]
  },
  {
    key: 'failureReason',
    label: '失败原因',
    type: 'select',
    placeholder: '请选择失败原因',
    options: [
      { label: 'card_declined', value: 'card_declined' },
      { label: 'insufficient_funds', value: 'insufficient_funds' },
      { label: 'expired_card', value: 'expired_card' },
      { label: 'incorrect_cvc', value: 'incorrect_cvc' },
      { label: 'processing_error', value: 'processing_error' }
    ]
  },
  {
    key: 'dateRange',
    label: '创建时间',
    type: 'date-range',
    placeholder: '请选择创建时间',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]);

// Methods
const fetchTransactions = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getPaymentTransactions(params);
    // transactions.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    transactions.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `TRANS${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      piId: `pi_${Math.random().toString(36).substr(2, 10)}`,
      csId: `cs_${Math.random().toString(36).substr(2, 10)}`,
      amount: `¥${(Math.random() * 1000).toFixed(2)}`,
      status: ['SUCCEEDED', 'FAILED', 'PROCESSING', 'CANCELED'][i % 4],
      failureReason: ['card_declined', 'insufficient_funds', 'expired_card', 'incorrect_cvc', 'processing_error', ''][i % 6],
      retryCount: Math.floor(Math.random() * 5),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchTransactions({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchTransactions({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchTransactions({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (transaction) => {
  // Handle view transaction details
  console.log('View transaction:', transaction);
};

const handleRetry = (transaction) => {
  // Handle retry transaction
  console.log('Retry transaction:', transaction);
};

const handleWebhookReplay = (transaction) => {
  // Handle replay webhook
  console.log('Replay webhook for transaction:', transaction);
};

const getStatusTagType = (status) => {
  const types = {
    SUCCEEDED: 'success',
    FAILED: 'danger',
    PROCESSING: 'warning',
    CANCELED: 'info'
  };
  return types[status] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchTransactions({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.payment-transaction {
  padding: 20px;
}
</style>