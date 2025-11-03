<template>
  <div class="audit-logs">
    <div class="header">
      <h2>{{ $t('audit.logs.title') }}</h2>
    </div>

    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />

    <x-table
      :data="auditLogs"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('audit.logs.id')" width="180" />
      <el-table-column prop="userId" :label="$t('audit.logs.userId')" width="180" />
      <el-table-column prop="action" :label="$t('audit.logs.action')" width="200" />
      <el-table-column prop="resourceType" :label="$t('audit.logs.resourceType')" width="150" />
      <el-table-column prop="resourceId" :label="$t('audit.logs.resourceId')" width="180" />
      <el-table-column prop="timestamp" :label="$t('audit.logs.timestamp')" width="180" />
      <el-table-column :label="$t('common.actions')" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewLog(row)">
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
const auditLogs = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  userId: '',
  action: '',
  resourceType: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'userId',
    label: '用户ID',
    type: 'text',
    placeholder: '请输入用户ID'
  },
  {
    key: 'action',
    label: '操作',
    type: 'select',
    placeholder: '请选择操作',
    options: [
      { label: '创建', value: 'create' },
      { label: '更新', value: 'update' },
      { label: '删除', value: 'delete' },
      { label: '查询', value: 'read' }
    ]
  },
  {
    key: 'resourceType',
    label: '资源类型',
    type: 'select',
    placeholder: '请选择资源类型',
    options: [
      { label: '用户', value: 'user' },
      { label: '课程', value: 'course' },
      { label: '订单', value: 'order' },
      { label: '支付', value: 'payment' }
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
const fetchAuditLogs = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getAuditLogs(params);
    // auditLogs.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    auditLogs.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `LOG${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      userId: `USER${Math.floor(Math.random() * 1000)}`,
      action: ['create', 'update', 'delete', 'read'][Math.floor(Math.random() * 4)],
      resourceType: ['user', 'course', 'order', 'payment'][Math.floor(Math.random() * 4)],
      resourceId: `RES${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      details: {}
    }));
    
    pagination.value.total = 10000; // Mock total
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  // Apply filters and fetch data
  console.log('Search with filters:', filters.value);
  fetchAuditLogs({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchAuditLogs({ ...filters.value, page, pageSize });
};

const handleViewLog = (log) => {
  // Handle view log details
  console.log('View log details:', log);
};

// Lifecycle
onMounted(() => {
  fetchAuditLogs({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.audit-logs {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style>