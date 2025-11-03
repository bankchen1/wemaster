<template>
  <div class="user-list">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="users"
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
      <el-table-column prop="role" label="角色" width="100" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ row.role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tenant" label="租户" width="120" sortable="custom" />
      <el-table-column prop="registeredAt" label="注册时间" width="180" sortable="custom" />
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
const users = ref([]);
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
    key: 'role',
    label: '角色',
    type: 'select',
    placeholder: '请选择角色',
    options: [
      { label: '管理员', value: 'ADMIN' },
      { label: '导师', value: 'TUTOR' },
      { label: '学生', value: 'STUDENT' }
    ]
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
    key: 'dateRange',
    label: '注册时间',
    type: 'date-range',
    placeholder: '请选择注册时间',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]);

// Methods
const fetchUsers = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getUsers(params);
    // users.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    users.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `User ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      email: `user${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}@example.com`,
      role: ['ADMIN', 'TUTOR', 'STUDENT'][i % 3],
      status: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'][i % 4],
      tenant: `tenant${(i % 3) + 1}`,
      avatar: `https://api.dicebear.com/6.x/initials/svg?seed=User${i + 1}`,
      registeredAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch users:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchUsers({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchUsers({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchUsers({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (user) => {
  router.push(`/users/detail/${user.id}`);
};

const handleEdit = (user) => {
  // Handle edit user
  console.log('Edit user:', user);
};

const handleDelete = (user) => {
  // Handle delete user
  console.log('Delete user:', user);
};

const getRoleTagType = (role) => {
  const types = {
    ADMIN: 'info',
    TUTOR: 'warning',
    STUDENT: 'success'
  };
  return types[role] || 'info';
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

// Lifecycle
onMounted(() => {
  fetchUsers({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.user-list {
  padding: 20px;
}
</style>