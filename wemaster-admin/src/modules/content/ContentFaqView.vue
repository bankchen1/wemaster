<template>
  <div class="content-faq-view">
    <h2>{{ $t('content.faq.title') }}</h2>
    <div class="faq-header">
      <el-button type="primary" @click="handleCreateFaq">
        {{ $t('content.faq.actions.create') }}
      </el-button>
    </div>
    <x-table
      :data="faqs"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('content.faq.id')" width="180" />
      <el-table-column prop="question" :label="$t('content.faq.question')" />
      <el-table-column prop="category" :label="$t('content.faq.category')" width="150" />
      <el-table-column prop="status" :label="$t('content.faq.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" :label="$t('content.faq.updatedAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            {{ $t('common.edit') }}
          </el-button>
          <el-button
            v-if="row.status === 'draft'"
            type="success"
            size="small"
            @click="handlePublish(row)"
          >
            {{ $t('content.faq.actions.publish') }}
          </el-button>
          <el-button
            v-if="row.status === 'published'"
            type="warning"
            size="small"
            @click="handleUnpublish(row)"
          >
            {{ $t('content.faq.actions.unpublish') }}
          </el-button>
        </template>
      </el-table-column>
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XTable from '@/components/shared/XTable.vue';

// State
const faqs = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

// Methods
const getStatusType = (status) => {
  const statusMap = {
    draft: 'info',
    published: 'success'
  };
  return statusMap[status] || '';
};

const handleCreateFaq = () => {
  console.log('Create FAQ');
};

const handleEdit = (faq) => {
  console.log('Edit FAQ:', faq);
};

const handlePublish = (faq) => {
  console.log('Publish FAQ:', faq);
};

const handleUnpublish = (faq) => {
  console.log('Unpublish FAQ:', faq);
};

const fetchFaqs = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    faqs.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `FAQ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      question: `这是FAQ问题 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      category: ['账号', '课程', '支付', '技术'][Math.floor(Math.random() * 4)],
      status: ['draft', 'published'][Math.floor(Math.random() * 2)],
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchFaqs({ page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchFaqs({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.content-faq-view {
  padding: 20px;
}

.faq-header {
  margin-bottom: 20px;
}
</style>