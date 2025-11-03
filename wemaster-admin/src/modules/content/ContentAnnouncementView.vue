<template>
  <div class="content-announcement-view">
    <h2>{{ $t('content.announcements.title') }}</h2>
    <div class="announcement-header">
      <el-button type="primary" @click="handleCreateAnnouncement">
        {{ $t('content.announcements.actions.create') }}
      </el-button>
    </div>
    <x-table
      :data="announcements"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('content.announcements.id')" width="180" />
      <el-table-column prop="title" :label="$t('content.announcements.title')" />
      <el-table-column prop="status" :label="$t('content.announcements.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publishAt" :label="$t('content.announcements.publishAt')" width="180" />
      <el-table-column prop="expiresAt" :label="$t('content.announcements.expiresAt')" width="180" />
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
            {{ $t('content.announcements.actions.publish') }}
          </el-button>
          <el-button
            v-if="row.status === 'published'"
            type="warning"
            size="small"
            @click="handleUnpublish(row)"
          >
            {{ $t('content.announcements.actions.unpublish') }}
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
const announcements = ref([]);
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
    published: 'success',
    expired: 'warning'
  };
  return statusMap[status] || '';
};

const handleCreateAnnouncement = () => {
  console.log('Create announcement');
};

const handleEdit = (announcement) => {
  console.log('Edit announcement:', announcement);
};

const handlePublish = (announcement) => {
  console.log('Publish announcement:', announcement);
};

const handleUnpublish = (announcement) => {
  console.log('Unpublish announcement:', announcement);
};

const fetchAnnouncements = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    announcements.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `ANN${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      title: `公告标题 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      status: ['draft', 'published', 'expired'][Math.floor(Math.random() * 3)],
      publishAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchAnnouncements({ page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchAnnouncements({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.content-announcement-view {
  padding: 20px;
}

.announcement-header {
  margin-bottom: 20px;
}
</style>