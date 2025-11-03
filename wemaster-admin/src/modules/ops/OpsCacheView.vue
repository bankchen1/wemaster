<template>
  <div class="ops-cache-view">
    <h2>{{ $t('ops.cache.title') }}</h2>
    <div class="cache-header">
      <el-button type="primary" @click="handleClearCache">
        {{ $t('ops.cache.actions.clearAll') }}
      </el-button>
      <el-button @click="handleRefresh">
        {{ $t('ops.cache.actions.refresh') }}
      </el-button>
    </div>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="cacheKeys"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="key" :label="$t('ops.cache.key')" />
      <el-table-column prop="type" :label="$t('ops.cache.type')" width="150" />
      <el-table-column prop="size" :label="$t('ops.cache.size')" width="120" />
      <el-table-column prop="ttl" :label="$t('ops.cache.ttl')" width="120" />
      <el-table-column prop="lastAccessed" :label="$t('ops.cache.lastAccessed')" width="180" />
      <el-table-column :label="$t('common.actions')" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="handleClearKey(row)">
            {{ $t('ops.cache.actions.clear') }}
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
const cacheKeys = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  key: '',
  type: ''
});
const filterFields = ref([
  {
    key: 'key',
    label: '键名',
    type: 'text',
    placeholder: '请输入键名'
  },
  {
    key: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    options: [
      { label: '字符串', value: 'string' },
      { label: '哈希', value: 'hash' },
      { label: '列表', value: 'list' },
      { label: '集合', value: 'set' },
      { label: '有序集合', value: 'zset' }
    ]
  }
]);

// Methods
const handleClearCache = () => {
  console.log('Clear all cache');
};

const handleRefresh = () => {
  console.log('Refresh cache');
  fetchCacheKeys({ page: 1, pageSize: pagination.value.pageSize });
};

const handleClearKey = (key) => {
  console.log('Clear cache key:', key);
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchCacheKeys({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const fetchCacheKeys = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    cacheKeys.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      key: `cache:key:${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      type: ['string', 'hash', 'list', 'set', 'zset'][Math.floor(Math.random() * 5)],
      size: `${Math.floor(Math.random() * 1000)} bytes`,
      ttl: `${Math.floor(Math.random() * 3600)}s`,
      lastAccessed: new Date(Date.now() - Math.floor(Math.random() * 3600) * 1000).toISOString()
    }));
    
    pagination.value.total = 10000; // Mock total
  } catch (error) {
    console.error('Failed to fetch cache keys:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchCacheKeys({ ...filters.value, page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchCacheKeys({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.ops-cache-view {
  padding: 20px;
}

.cache-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
</style>