<template>
  <div class="course-list">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="courses"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="100" sortable="custom" />
      <el-table-column prop="title" label="课程名称" width="200" sortable="custom" />
      <el-table-column prop="tutor" label="导师" width="120" sortable="custom" />
      <el-table-column prop="status" label="状态" width="100" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="100" sortable="custom" />
      <el-table-column prop="rating" label="评分" width="100" sortable="custom" />
      <el-table-column prop="lastPublished" label="最近上架时间" width="180" sortable="custom" />
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
const courses = ref([]);
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
    placeholder: '请输入课程名称'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '草稿', value: 'DRAFT' },
      { label: '已发布', value: 'PUBLISHED' },
      { label: '已下架', value: 'UNPUBLISHED' },
      { label: '待审核', value: 'PENDING' }
    ]
  },
  {
    key: 'tutor',
    label: '导师',
    type: 'text',
    placeholder: '请输入导师姓名'
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
const fetchCourses = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getCourses(params);
    // courses.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    courses.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `COURSE${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      title: `Course ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      tutor: `Tutor ${(i % 10) + 1}`,
      status: ['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'PENDING'][i % 4],
      sales: Math.floor(Math.random() * 1000),
      rating: (Math.random() * 5).toFixed(1),
      lastPublished: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch courses:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchCourses({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchCourses({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchCourses({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (course) => {
  router.push(`/courses/detail/${course.id}`);
};

const handleEdit = (course) => {
  // Handle edit course
  console.log('Edit course:', course);
};

const handleDelete = (course) => {
  // Handle delete course
  console.log('Delete course:', course);
};

const getStatusTagType = (status) => {
  const types = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    UNPUBLISHED: 'warning',
    PENDING: 'warning'
  };
  return types[status] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchCourses({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.course-list {
  padding: 20px;
}
</style>