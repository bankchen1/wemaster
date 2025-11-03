<template>
  <div class="content-article">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="articles"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="文章ID" width="180" sortable="custom" />
      <el-table-column prop="title" label="标题" width="300" sortable="custom" show-overflow-tooltip />
      <el-table-column prop="author" label="作者" width="150" sortable="custom" />
      <el-table-column prop="status" label="状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="views" label="浏览量" width="100" sortable="custom" />
      <el-table-column prop="likes" label="点赞数" width="100" sortable="custom" />
      <el-table-column prop="publishTime" label="发布时间" width="180" sortable="custom" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="warning" size="small" @click="handlePublish(row)" v-if="row.status === 'DRAFT'">
            发布
          </el-button>
          <el-button type="info" size="small" @click="handleUnpublish(row)" v-if="row.status === 'PUBLISHED'">
            下架
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
const articles = ref([]);
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
    placeholder: '请输入文章标题或作者'
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
    key: 'dateRange',
    label: '发布时间',
    type: 'date-range',
    placeholder: '请选择发布时间',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]);

// Methods
const fetchArticles = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getContentArticles(params);
    // articles.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    articles.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `ARTICLE${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      title: `文章标题 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      author: `作者 ${(i % 10) + 1}`,
      status: ['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'PENDING'][i % 4],
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 1000),
      publishTime: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchArticles({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchArticles({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchArticles({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (article) => {
  // Handle view article details
  console.log('View article:', article);
};

const handleEdit = (article) => {
  // Handle edit article
  console.log('Edit article:', article);
};

const handlePublish = (article) => {
  // Handle publish article
  console.log('Publish article:', article);
};

const handleUnpublish = (article) => {
  // Handle unpublish article
  console.log('Unpublish article:', article);
};

const handleDelete = (article) => {
  // Handle delete article
  console.log('Delete article:', article);
};

const getStatusTagType = (status) => {
  const types = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    UNPUBLISHED: 'warning',
    PENDING: 'primary'
  };
  return types[status] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchArticles({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.content-article {
  padding: 20px;
}
</style>