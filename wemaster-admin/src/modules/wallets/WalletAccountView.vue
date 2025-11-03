<template>
  <div class="wallet-account">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="accounts"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="账户ID" width="180" sortable="custom" />
      <el-table-column prop="user" label="用户" width="150" sortable="custom" />
      <el-table-column prop="balance" label="余额" width="120" sortable="custom" />
      <el-table-column prop="frozenAmount" label="冻结金额" width="120" sortable="custom" />
      <el-table-column prop="riskFlag" label="风险标记" width="100" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="row.riskFlag ? 'danger' : 'success'">
            {{ row.riskFlag ? '有风险' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastTransaction" label="最后交易时间" width="180" sortable="custom" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleAdjust(row)">
            调整
          </el-button>
          <el-button type="warning" size="small" @click="handleFreeze(row)">
            冻结/解冻
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
const accounts = ref([]);
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
    placeholder: '请输入用户姓名或邮箱'
  },
  {
    key: 'riskFlag',
    label: '风险标记',
    type: 'select',
    placeholder: '请选择风险状态',
    options: [
      { label: '有风险', value: 'true' },
      { label: '正常', value: 'false' }
    ]
  },
  {
    key: 'dateRange',
    label: '最后交易时间',
    type: 'date-range',
    placeholder: '请选择最后交易时间',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]);

// Methods
const fetchAccounts = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getWalletAccounts(params);
    // accounts.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    accounts.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `ACC${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      user: `User ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      balance: `¥${(Math.random() * 5000).toFixed(2)}`,
      frozenAmount: `¥${(Math.random() * 1000).toFixed(2)}`,
      riskFlag: Math.random() > 0.9,
      lastTransaction: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchAccounts({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchAccounts({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchAccounts({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (account) => {
  // Handle view account details
  console.log('View account:', account);
};

const handleAdjust = (account) => {
  // Handle adjust account balance
  console.log('Adjust account:', account);
};

const handleFreeze = (account) => {
  // Handle freeze/unfreeze account
  console.log('Freeze/Unfreeze account:', account);
};

// Lifecycle
onMounted(() => {
  fetchAccounts({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.wallet-account {
  padding: 20px;
}
</style>