<template>
  <div class="moderation-blacklist-view">
    <h2>{{ $t('moderation.blacklist.title') }}</h2>
    <div class="blacklist-header">
      <el-button type="primary" @click="handleAddToBlacklist">
        {{ $t('moderation.blacklist.actions.addToBlacklist') }}
      </el-button>
    </div>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="blacklist"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('moderation.blacklist.id')" width="180" />
      <el-table-column prop="target" :label="$t('moderation.blacklist.target')" />
      <el-table-column prop="type" :label="$t('moderation.blacklist.type')" width="150" />
      <el-table-column prop="reason" :label="$t('moderation.blacklist.reason')" />
      <el-table-column prop="addedBy" :label="$t('moderation.blacklist.addedBy')" width="150" />
      <el-table-column prop="addedAt" :label="$t('moderation.blacklist.addedAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="handleRemove(row)">
            {{ $t('moderation.blacklist.actions.remove') }}
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
const blacklist = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  target: '',
  type: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'target',
    label: '目标',
    type: 'text',
    placeholder: '请输入目标内容'
  },
  {
    key: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    options: [
      { label: '用户', value: 'user' },
      { label: 'IP地址', value: 'ip' },
      { label: '设备', value: 'device' },
      { label: '关键词', value: 'keyword' }
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
const handleAddToBlacklist = () => {
  console.log('Add to blacklist');
};

const handleRemove = (item) => {
  console.log('Remove from blacklist:', item);
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchBlacklist({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const fetchBlacklist = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    blacklist.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `BLACKLIST${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      target: `目标 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      type: ['user', 'ip', 'device', 'keyword'][Math.floor(Math.random() * 4)],
      reason: `违规原因 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      addedBy: `管理员${Math.floor(Math.random() * 10)}`,
      addedAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 10000; // Mock total
  } catch (error) {
    console.error('Failed to fetch blacklist:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchBlacklist({ ...filters.value, page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchBlacklist({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.moderation-blacklist-view {
  padding: 20px;
}

.blacklist-header {
  margin-bottom: 20px;
}
</style>