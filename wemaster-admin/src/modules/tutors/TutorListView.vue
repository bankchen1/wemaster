<template>
  <div class="tutor-list">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="tutors"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="avatar" label="头像" width="80">
        <template #default="{ row }">
          <el-avatar :src="row.avatar" size="small" />
        </template>
      </el-table-column>
      <el-table-column prop="id" label="ID" width="100" sortable="custom" />
      <el-table-column prop="name" label="姓名" width="120" sortable="custom" />
      <el-table-column prop="email" label="邮箱" width="200" sortable="custom" />
      <el-table-column prop="status" label="审核状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="availableTimes" label="可约时段" width="150" />
      <el-table-column prop="rating" label="评分" width="100" sortable="custom" />
      <el-table-column prop="earningsMonth" label="收益月" width="120" sortable="custom" />
      <el-table-column prop="activeLevel" label="活跃度" width="100" sortable="custom">
        <template #default="{ row }">
          <el-progress :percentage="row.activeLevel" :show-text="false" />
        </template>
      </el-table-column>
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
const tutors = ref([]);
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
    placeholder: '请输入姓名或邮箱'
  },
  {
    key: 'status',
    label: '审核状态',
    type: 'select',
    placeholder: '请选择审核状态',
    options: [
      { label: '待审核', value: 'PENDING' },
      { label: '已通过', value: 'APPROVED' },
      { label: '已拒绝', value: 'REJECTED' },
      { label: '已暂停', value: 'SUSPENDED' }
    ]
  },
  {
    key: 'dateRange',
    label: '注册时间',
    type: 'date-range',
    placeholder: '请选择注册时间',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]);

// Methods
const fetchTutors = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getTutors(params);
    // tutors.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    tutors.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `TUTOR${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `Tutor ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      email: `tutor${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}@example.com`,
      status: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'][i % 4],
      availableTimes: ['Mon-Fri 9-18', 'Weekend', 'Flexible'][i % 3],
      rating: (Math.random() * 5).toFixed(1),
      earningsMonth: `¥${Math.floor(Math.random() * 10000)}`,
      activeLevel: Math.floor(Math.random() * 100),
      avatar: `https://api.dicebear.com/6.x/initials/svg?seed=Tutor${i + 1}`,
      registeredAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch tutors:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchTutors({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchTutors({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchTutors({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (tutor) => {
  router.push(`/tutors/detail/${tutor.id}`);
};

const handleEdit = (tutor) => {
  // Handle edit tutor
  console.log('Edit tutor:', tutor);
};

const handleDelete = (tutor) => {
  // Handle delete tutor
  console.log('Delete tutor:', tutor);
};

const getStatusTagType = (status) => {
  const types = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    SUSPENDED: 'info'
  };
  return types[status] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchTutors({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.tutor-list {
  padding: 20px;
}
</style>