<template>
  <div class="marketing-campaign-view">
    <h2>{{ $t('marketing.campaigns.title') }}</h2>
    <div class="campaign-header">
      <el-button type="primary" @click="handleCreateCampaign">
        {{ $t('marketing.campaigns.actions.create') }}
      </el-button>
    </div>
    <x-filter
      :model-value="filters"
      :fields="filterFields"
      @update:model-value="handleFilterChange"
      @search="handleSearch"
    />
    <x-table
      :data="campaigns"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('marketing.campaigns.id')" width="180" />
      <el-table-column prop="name" :label="$t('marketing.campaigns.name')" />
      <el-table-column prop="status" :label="$t('marketing.campaigns.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startDate" :label="$t('marketing.campaigns.startDate')" width="180" />
      <el-table-column prop="endDate" :label="$t('marketing.campaigns.endDate')" width="180" />
      <el-table-column prop="budget" :label="$t('marketing.campaigns.budget')" width="120">
        <template #default="{ row }">
          ¥{{ row.budget }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            {{ $t('common.edit') }}
          </el-button>
          <el-button
            v-if="row.status === 'draft'"
            type="success"
            size="small"
            @click="handleLaunch(row)"
          >
            {{ $t('marketing.campaigns.actions.launch') }}
          </el-button>
          <el-button
            v-if="row.status === 'active'"
            type="warning"
            size="small"
            @click="handlePause(row)"
          >
            {{ $t('marketing.campaigns.actions.pause') }}
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
const campaigns = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const filters = ref({
  name: '',
  status: '',
  dateRange: []
});
const filterFields = ref([
  {
    key: 'name',
    label: '活动名称',
    type: 'text',
    placeholder: '请输入活动名称'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '草稿', value: 'draft' },
      { label: '进行中', value: 'active' },
      { label: '已暂停', value: 'paused' },
      { label: '已结束', value: 'ended' }
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
const getStatusType = (status) => {
  const statusMap = {
    draft: 'info',
    active: 'success',
    paused: 'warning',
    ended: 'danger'
  };
  return statusMap[status] || '';
};

const handleCreateCampaign = () => {
  console.log('Create campaign');
};

const handleEdit = (campaign) => {
  console.log('Edit campaign:', campaign);
};

const handleLaunch = (campaign) => {
  console.log('Launch campaign:', campaign);
};

const handlePause = (campaign) => {
  console.log('Pause campaign:', campaign);
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
};

const handleSearch = () => {
  console.log('Search with filters:', filters.value);
  fetchCampaigns({ ...filters.value, page: 1, pageSize: pagination.value.pageSize });
};

const fetchCampaigns = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    campaigns.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `CAMPAIGN${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `营销活动 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      status: ['draft', 'active', 'paused', 'ended'][Math.floor(Math.random() * 4)],
      startDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      budget: Math.floor(Math.random() * 10000) + 1000
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchCampaigns({ ...filters.value, page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchCampaigns({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.marketing-campaign-view {
  padding: 20px;
}

.campaign-header {
  margin-bottom: 20px;
}
</style>