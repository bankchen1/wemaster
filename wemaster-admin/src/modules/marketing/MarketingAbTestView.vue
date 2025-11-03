<template>
  <div class="marketing-abtest-view">
    <h2>{{ $t('marketing.abTests.title') }}</h2>
    <div class="abtest-header">
      <el-button type="primary" @click="handleCreateAbTest">
        {{ $t('marketing.abTests.actions.create') }}
      </el-button>
    </div>
    <x-table
      :data="abTests"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('marketing.abTests.id')" width="180" />
      <el-table-column prop="name" :label="$t('marketing.abTests.name')" />
      <el-table-column prop="status" :label="$t('marketing.abTests.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" :label="$t('marketing.abTests.startDate')" width="180" />
      <el-table-column prop="endDate" :label="$t('marketing.abTests.endDate')" width="180" />
      <el-table-column prop="conversionA" :label="$t('marketing.abTests.conversionA')" width="120" />
      <el-table-column prop="conversionB" :label="$t('marketing.abTests.conversionB')" width="120" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewDetails(row)">
            {{ $t('common.view') }}
          </el-button>
          <el-button
            v-if="row.status === 'active'"
            type="warning"
            size="small"
            @click="handleStop(row)"
          >
            {{ $t('marketing.abTests.actions.stop') }}
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
const abTests = ref([]);
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
    active: 'success',
    completed: 'warning',
    stopped: 'danger'
  };
  return statusMap[status] || '';
};

const handleCreateAbTest = () => {
  console.log('Create A/B test');
};

const handleViewDetails = (abTest) => {
  console.log('View A/B test details:', abTest);
};

const handleStop = (abTest) => {
  console.log('Stop A/B test:', abTest);
};

const fetchAbTests = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    abTests.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `ABTEST${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `A/B测试 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      status: ['draft', 'active', 'completed', 'stopped'][Math.floor(Math.random() * 4)],
      startDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      conversionA: `${(Math.random() * 10).toFixed(2)}%`,
      conversionB: `${(Math.random() * 10).toFixed(2)}%`
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch A/B tests:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchAbTests({ page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchAbTests({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.marketing-abtest-view {
  padding: 20px;
}

.abtest-header {
  margin-bottom: 20px;
}
</style>