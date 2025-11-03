<template>
  <div class="settings-feature-flags">
    <div class="header">
      <h2>{{ $t('settings.featureFlags.title') }}</h2>
      <el-button type="primary" @click="handleCreateFlag">
        {{ $t('common.create') }}
      </el-button>
    </div>

    <x-table
      :data="featureFlags"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('settings.featureFlags.id')" width="180" />
      <el-table-column prop="name" :label="$t('settings.featureFlags.name')" width="200" />
      <el-table-column prop="description" :label="$t('settings.featureFlags.description')" />
      <el-table-column prop="enabled" :label="$t('settings.featureFlags.enabled')" width="120">
        <template #default="{ row }">
          <el-switch
            v-model="row.enabled"
            :active-text="$t('common.yes')"
            :inactive-text="$t('common.no')"
            @change="handleToggleFlag(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" :label="$t('settings.featureFlags.createdAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEditFlag(row)">
            {{ $t('common.edit') }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDeleteFlag(row)">
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

// State
const featureFlags = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

// Methods
const fetchFeatureFlags = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getFeatureFlags(params);
    // featureFlags.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    featureFlags.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `FLAG${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `功能 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      description: `这是功能 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1} 的描述`,
      enabled: Math.random() > 0.5,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch feature flags:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchFeatureFlags({ page, pageSize });
};

const handleCreateFlag = () => {
  // Handle create feature flag
  console.log('Create feature flag');
};

const handleEditFlag = (flag) => {
  // Handle edit feature flag
  console.log('Edit feature flag:', flag);
};

const handleDeleteFlag = (flag) => {
  // Handle delete feature flag
  console.log('Delete feature flag:', flag);
};

const handleToggleFlag = (flag) => {
  // Handle toggle feature flag
  console.log('Toggle feature flag:', flag);
};

// Lifecycle
onMounted(() => {
  fetchFeatureFlags({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.settings-feature-flags {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style>