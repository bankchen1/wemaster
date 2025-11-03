<template>
  <div class="subscription-plan">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="plans"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="100" sortable="custom" />
      <el-table-column prop="name" label="计划名称" width="200" sortable="custom" />
      <el-table-column prop="cycle" label="周期" width="100" sortable="custom" />
      <el-table-column prop="price" label="价格" width="120" sortable="custom" />
      <el-table-column prop="status" label="状态" width="100" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="members" label="会员数" width="100" sortable="custom" />
      <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleEdit(row)">
            编辑
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
const plans = ref([]);
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
    placeholder: '请输入计划名称'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '已上架', value: 'PUBLISHED' },
      { label: '已下架', value: 'UNPUBLISHED' },
      { label: '草稿', value: 'DRAFT' }
    ]
  },
  {
    key: 'cycle',
    label: '周期',
    type: 'select',
    placeholder: '请选择周期',
    options: [
      { label: '月付', value: 'MONTHLY' },
      { label: '年付', value: 'YEARLY' },
      { label: '季付', value: 'QUARTERLY' }
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
const fetchPlans = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getSubscriptionPlans(params);
    // plans.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    plans.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `PLAN${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `VIP Plan ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      cycle: ['MONTHLY', 'YEARLY', 'QUARTERLY'][i % 3],
      price: `¥${[29.9, 99.9, 199.9, 299.9][i % 4]}`,
      status: ['PUBLISHED', 'UNPUBLISHED', 'DRAFT'][i % 3],
      members: Math.floor(Math.random() * 1000),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch plans:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchPlans({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchPlans({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchPlans({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (plan) => {
  router.push(`/subscriptions/plans/detail/${plan.id}`);
};

const handleEdit = (plan) => {
  // Handle edit plan
  console.log('Edit plan:', plan);
};

const handleDelete = (plan) => {
  // Handle delete plan
  console.log('Delete plan:', plan);
};

const getStatusTagType = (status) => {
  const types = {
    PUBLISHED: 'success',
    UNPUBLISHED: 'warning',
    DRAFT: 'info'
  };
  return types[status] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchPlans({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.subscription-plan {
  padding: 20px;
}
</style>