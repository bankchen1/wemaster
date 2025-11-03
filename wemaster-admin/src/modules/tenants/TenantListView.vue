<template>
  <div class="tenant-list">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="tenants"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="租户ID" width="180" sortable="custom" />
      <el-table-column prop="name" label="名称" width="200" sortable="custom" />
      <el-table-column prop="slug" label="标识" width="150" sortable="custom" />
      <el-table-column prop="status" label="状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="domain" label="域名" width="200" sortable="custom" />
      <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="warning" size="small" @click="handleDisable(row)" v-if="row.status === 'ACTIVE'">
            禁用
          </el-button>
          <el-button type="info" size="small" @click="handleEnable(row)" v-if="row.status === 'INACTIVE'">
            启用
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import XFilter from '@/components/shared/XFilter.vue';
import XTable from '@/components/shared/XTable.vue';

// Router
const router = useRouter();

// State
const tenants = ref([]);
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
    placeholder: '请输入租户名称或标识'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '激活', value: 'ACTIVE' },
      { label: '未激活', value: 'INACTIVE' },
      { label: '已暂停', value: 'SUSPENDED' }
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
const fetchTenants = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getTenants(params);
    // tenants.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    tenants.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `TENANT${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `租户 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      slug: `tenant-${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      status: ['ACTIVE', 'INACTIVE', 'SUSPENDED'][i % 3],
      domain: `tenant${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}.example.com`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchTenants({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchTenants({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchTenants({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (tenant) => {
  router.push(`/tenants/detail/${tenant.id}`);
};

const handleEdit = (tenant) => {
  // Handle edit tenant
  console.log('Edit tenant:', tenant);
};

const handleDisable = (tenant) => {
  // Handle disable tenant
  console.log('Disable tenant:', tenant);
};

const handleEnable = (tenant) => {
  // Handle enable tenant
  console.log('Enable tenant:', tenant);
};

const handleDelete = (tenant) => {
  // Handle delete tenant
  console.log('Delete tenant:', tenant);
};

const getStatusTagType = (status) => {
  const types = {
    ACTIVE: 'success',
    INACTIVE: 'info',
    SUSPENDED: 'danger'
  };
  return types[status] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchTenants({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.tenant-list {
  padding: 20px;
}
</style>