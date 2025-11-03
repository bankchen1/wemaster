<template>
  <div class="message-report-view">
    <h2>{{ $t('messages.reports.title') }}</h2>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="reports"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('messages.reports.id')" width="180" />
      <el-table-column prop="reporter" :label="$t('messages.reports.reporter')" width="150" />
      <el-table-column prop="reportedUser" :label="$t('messages.reports.reportedUser')" width="150" />
      <el-table-column prop="reason" :label="$t('messages.reports.reason')" />
      <el-table-column prop="status" :label="$t('messages.reports.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" :label="$t('messages.reports.createdAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewDetails(row)">
            {{ $t('common.view') }}
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="success"
            size="small"
            @click="handleResolve(row)"
          >
            {{ $t('messages.reports.actions.resolve') }}
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
const reports = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  reporter: '',
  reportedUser: '',
  status: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'reporter',
    label: '举报人',
    type: 'text',
    placeholder: '请输入举报人名称'
  },
  {
    key: 'reportedUser',
    label: '被举报人',
    type: 'text',
    placeholder: '请输入被举报人名称'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '待处理', value: 'pending' },
      { label: '已处理', value: 'resolved' },
      { label: '已忽略', value: 'ignored' }
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
    resolved: 'success',
    ignored: 'info'
  };
  return statusMap[status] || '';
};

const fetchReports = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    reports.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `REPORT${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      reporter: `用户 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      reportedUser: `用户 ${Math.floor(Math.random() * 100)}`,
      reason: `举报原因 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      status: ['pending', 'resolved', 'ignored'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch reports:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchReports({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchReports({ ...filters.value, page, pageSize });
};

const handleViewDetails = (report) => {
  console.log('View report details:', report);
};

const handleResolve = (report) => {
  console.log('Resolve report:', report);
};

// Lifecycle
onMounted(() => {
  fetchReports({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.message-report-view {
  padding: 20px;
}
</style>