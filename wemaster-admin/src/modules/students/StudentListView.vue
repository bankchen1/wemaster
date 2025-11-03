<template>
  <div class="student-list">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="students"
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
      <el-table-column prop="status" label="状态" width="100" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="vipLevel" label="VIP等级" width="100" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getVipLevelTagType(row.vipLevel)">
            {{ row.vipLevel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="walletBalance" label="钱包余额" width="120" sortable="custom" />
      <el-table-column prop="coursesPurchased" label="购买课程数" width="120" sortable="custom" />
      <el-table-column prop="learningProgress" label="学习进度" width="150" sortable="custom">
        <template #default="{ row }">
          <el-progress :percentage="row.learningProgress" :show-text="false" />
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
const students = ref([]);
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
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '激活', value: 'ACTIVE' },
      { label: '未激活', value: 'INACTIVE' },
      { label: '已暂停', value: 'SUSPENDED' },
      { label: '待审核', value: 'PENDING' }
    ]
  },
  {
    key: 'vipLevel',
    label: 'VIP等级',
    type: 'select',
    placeholder: '请选择VIP等级',
    options: [
      { label: '青铜', value: 'BRONZE' },
      { label: '白银', value: 'SILVER' },
      { label: '黄金', value: 'GOLD' },
      { label: '钻石', value: 'DIAMOND' }
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
const fetchStudents = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getStudents(params);
    // students.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    students.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `STU${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `Student ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      email: `student${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}@example.com`,
      status: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'][i % 4],
      vipLevel: ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'][i % 4],
      walletBalance: `¥${Math.floor(Math.random() * 5000)}`,
      coursesPurchased: Math.floor(Math.random() * 50),
      learningProgress: Math.floor(Math.random() * 100),
      avatar: `https://api.dicebear.com/6.x/initials/svg?seed=Student${i + 1}`,
      registeredAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch students:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchStudents({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchStudents({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchStudents({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (student) => {
  router.push(`/students/detail/${student.id}`);
};

const handleEdit = (student) => {
  // Handle edit student
  console.log('Edit student:', student);
};

const handleDelete = (student) => {
  // Handle delete student
  console.log('Delete student:', student);
};

const getStatusTagType = (status) => {
  const types = {
    ACTIVE: 'success',
    INACTIVE: 'info',
    SUSPENDED: 'danger',
    PENDING: 'warning'
  };
  return types[status] || 'info';
};

const getVipLevelTagType = (vipLevel) => {
  const types = {
    BRONZE: '',
    SILVER: 'info',
    GOLD: 'warning',
    DIAMOND: 'success'
  };
  return types[vipLevel] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchStudents({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.student-list {
  padding: 20px;
}
</style>