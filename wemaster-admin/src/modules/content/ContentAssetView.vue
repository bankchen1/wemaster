<template>
  <div class="content-asset-view">
    <h2>{{ $t('content.assets.title') }}</h2>
    <div class="asset-header">
      <el-button type="primary" @click="handleUploadAsset">
        {{ $t('content.assets.actions.upload') }}
      </el-button>
    </div>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="assets"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('content.assets.id')" width="180" />
      <el-table-column prop="name" :label="$t('content.assets.name')" />
      <el-table-column prop="type" :label="$t('content.assets.type')" width="120" />
      <el-table-column prop="size" :label="$t('content.assets.size')" width="120" />
      <el-table-column prop="uploader" :label="$t('content.assets.uploader')" width="150" />
      <el-table-column prop="uploadedAt" :label="$t('content.assets.uploadedAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            {{ $t('common.view') }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            {{ $t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XTable from '@/components/shared/XTable.vue';
import XFilter from '@/components/shared/XFilter.vue';

// State
const assets = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  name: '',
  type: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'name',
    label: '名称',
    type: 'text',
    placeholder: '请输入素材名称'
  },
  {
    key: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    options: [
      { label: '图片', value: 'image' },
      { label: '视频', value: 'video' },
      { label: '文档', value: 'document' },
      { label: '音频', value: 'audio' }
    ]
  },
  {
    key: 'dateRange',
    label: '时间范围',
    type: 'dateRange',
    placeholder: '请选择时间范围'
  }
]);

// Methods
const handleUploadAsset = () => {
  console.log('Upload asset');
};

const handleView = (asset) => {
  console.log('View asset:', asset);
};

const handleDelete = (asset) => {
  console.log('Delete asset:', asset);
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchAssets({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const fetchAssets = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    assets.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `ASSET${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `素材 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      type: ['image', 'video', 'document', 'audio'][Math.floor(Math.random() * 4)],
      size: `${Math.floor(Math.random() * 10000)} KB`,
      uploader: `用户 ${Math.floor(Math.random() * 100)}`,
      uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 10000; // Mock total
  } catch (error) {
    console.error('Failed to fetch assets:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchAssets({ ...filters.value, page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchAssets({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.content-asset-view {
  padding: 20px;
}

.asset-header {
  margin-bottom: 20px;
}
</style>