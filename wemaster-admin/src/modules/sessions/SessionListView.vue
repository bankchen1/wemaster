<template>
  <div class="session-list">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="sessions"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="100" sortable="custom" />
      <el-table-column prop="course" label="课程" width="200" sortable="custom" />
      <el-table-column prop="tutor" label="导师" width="120" sortable="custom" />
      <el-table-column prop="student" label="学生" width="120" sortable="custom" />
      <el-table-column prop="scheduledTime" label="预约时间" width="180" sortable="custom" />
      <el-table-column prop="status" label="状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="时长" width="100" sortable="custom" />
      <el-table-column prop="attendance" label="出勤情况" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getAttendanceTagType(row.attendance)">
            {{ row.attendance }}
          </el-tag>
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
const sessions = ref([]);
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
    placeholder: '请输入课程名称或导师/学生姓名'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '待开始', value: 'PENDING' },
      { label: '进行中', value: 'IN_PROGRESS' },
      { label: '已完成', value: 'COMPLETED' },
      { label: '已取消', value: 'CANCELLED' },
      { label: '已改期', value: 'RESCHEDULED' }
    ]
  },
  {
    key: 'attendance',
    label: '出勤情况',
    type: 'select',
    placeholder: '请选择出勤情况',
    options: [
      { label: '已出席', value: 'ATTENDED' },
      { label: '未出席', value: 'NOT_ATTENDED' },
      { label: '迟到', value: 'LATE' },
      { label: '早退', value: 'LEFT_EARLY' }
    ]
  },
  {
    key: 'dateRange',
    label: '预约时间',
    type: 'date-range',
    placeholder: '请选择预约时间',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]);

// Methods
const fetchSessions = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getSessions(params);
    // sessions.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    sessions.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `SESSION${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      course: `Course ${(i % 20) + 1}`,
      tutor: `Tutor ${(i % 10) + 1}`,
      student: `Student ${(i % 50) + 1}`,
      scheduledTime: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      status: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'][i % 5],
      duration: `${30 + (i % 4) * 15}分钟`,
      attendance: ['ATTENDED', 'NOT_ATTENDED', 'LATE', 'LEFT_EARLY'][i % 4],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchSessions({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchSessions({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchSessions({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (session) => {
  router.push(`/sessions/detail/${session.id}`);
};

const handleEdit = (session) => {
  // Handle edit session
  console.log('Edit session:', session);
};

const handleDelete = (session) => {
  // Handle delete session
  console.log('Delete session:', session);
};

const getStatusTagType = (status) => {
  const types = {
    PENDING: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    RESCHEDULED: 'primary'
  };
  return types[status] || 'info';
};

const getAttendanceTagType = (attendance) => {
  const types = {
    ATTENDED: 'success',
    NOT_ATTENDED: 'danger',
    LATE: 'warning',
    LEFT_EARLY: 'warning'
  };
  return types[attendance] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchSessions({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.session-list {
  padding: 20px;
}
</style>