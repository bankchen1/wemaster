<template>
  <div class="ops-scheduler-view">
    <h2>{{ $t('ops.scheduler.title') }}</h2>
    <div class="scheduler-header">
      <el-button type="primary" @click="handleCreateTask">
        {{ $t('ops.scheduler.actions.create') }}
      </el-button>
      <el-button @click="handleRefresh">
        {{ $t('ops.scheduler.actions.refresh') }}
      </el-button>
    </div>
    <x-table
      :data="tasks"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('ops.scheduler.id')" width="180" />
      <el-table-column prop="name" :label="$t('ops.scheduler.name')" />
      <el-table-column prop="cron" :label="$t('ops.scheduler.cron')" width="150" />
      <el-table-column prop="status" :label="$t('ops.scheduler.status')" width="120">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="true"
            :inactive-value="false"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="lastRun" :label="$t('ops.scheduler.lastRun')" width="180" />
      <el-table-column prop="nextRun" :label="$t('ops.scheduler.nextRun')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            {{ $t('common.edit') }}
          </el-button>
          <el-button type="warning" size="small" @click="handleRunNow(row)">
            {{ $t('ops.scheduler.actions.runNow') }}
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

// State
const tasks = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

// Methods
const handleCreateTask = () => {
  console.log('Create scheduled task');
};

const handleEdit = (task) => {
  console.log('Edit scheduled task:', task);
};

const handleDelete = (task) => {
  console.log('Delete scheduled task:', task);
};

const handleStatusChange = (task) => {
  console.log('Change task status:', task);
};

const handleRunNow = (task) => {
  console.log('Run task now:', task);
};

const handleRefresh = () => {
  console.log('Refresh scheduled tasks');
  fetchTasks({ page: 1, pageSize: pagination.value.pageSize });
};

const fetchTasks = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    tasks.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `TASK${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `定时任务 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      cron: '0 */30 * * * *',
      status: Math.random() > 0.5,
      lastRun: new Date(Date.now() - Math.floor(Math.random() * 3600) * 1000).toISOString(),
      nextRun: new Date(Date.now() + Math.floor(Math.random() * 3600) * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch scheduled tasks:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchTasks({ ...filters.value, page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchTasks({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.ops-scheduler-view {
  padding: 20px;
}

.scheduler-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
</style>