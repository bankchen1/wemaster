<template>
  <div class="ops-queue-view">
    <h2>{{ $t('ops.queues.title') }}</h2>
    <div class="queue-header">
      <el-button type="primary" @click="handleRefresh">
        {{ $t('ops.queues.actions.refresh') }}
      </el-button>
      <el-button @click="handleRetryFailed">
        {{ $t('ops.queues.actions.retryFailed') }}
      </el-button>
    </div>
    <el-tabs v-model="activeQueue">
      <el-tab-pane
        v-for="queue in queues"
        :key="queue.name"
        :label="queue.name"
        :name="queue.name"
      >
        <div class="queue-stats">
          <el-card class="stat-card">
            <div class="stat-title">{{ $t('ops.queues.stats.pending') }}</div>
            <div class="stat-value">{{ queue.stats.pending }}</div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-title">{{ $t('ops.queues.stats.processing') }}</div>
            <div class="stat-value">{{ queue.stats.processing }}</div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-title">{{ $t('ops.queues.stats.completed') }}</div>
            <div class="stat-value">{{ queue.stats.completed }}</div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-title">{{ $t('ops.queues.stats.failed') }}</div>
            <div class="stat-value">{{ queue.stats.failed }}</div>
          </el-card>
        </div>
        <x-table
          :data="queue.jobs"
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column prop="id" :label="$t('ops.queues.jobId')" width="180" />
          <el-table-column prop="name" :label="$t('ops.queues.jobName')" />
          <el-table-column prop="status" :label="$t('ops.queues.status')" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="attempts" :label="$t('ops.queues.attempts')" width="120" />
          <el-table-column prop="createdAt" :label="$t('ops.queues.createdAt')" width="180" />
          <el-table-column prop="processedAt" :label="$t('ops.queues.processedAt')" width="180" />
          <el-table-column :label="$t('common.actions')" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'failed'"
                type="success"
                size="small"
                @click="handleRetryJob(row)"
              >
                {{ $t('ops.queues.actions.retry') }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteJob(row)">
                {{ $t('common.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </x-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XTable from '@/components/shared/XTable.vue';

// State
const activeQueue = ref('default');
const queues = ref([]);
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
    pending: 'info',
    processing: 'primary',
    completed: 'success',
    failed: 'danger'
  };
  return statusMap[status] || '';
};

const handleRefresh = () => {
  console.log('Refresh queues');
  fetchQueues();
};

const handleRetryFailed = () => {
  console.log('Retry failed jobs');
};

const handleRetryJob = (job) => {
  console.log('Retry job:', job);
};

const handleDeleteJob = (job) => {
  console.log('Delete job:', job);
};

const fetchQueues = async () => {
  loading.value = true;
  try {
    // Mock data
    queues.value = [
      {
        name: 'default',
        stats: {
          pending: Math.floor(Math.random() * 100),
          processing: Math.floor(Math.random() * 50),
          completed: Math.floor(Math.random() * 1000),
          failed: Math.floor(Math.random() * 10)
        },
        jobs: Array.from({ length: pagination.value.pageSize }, (_, i) => ({
          id: `JOB${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
          name: `任务 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
          status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)],
          attempts: Math.floor(Math.random() * 5),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 3600) * 1000).toISOString(),
          processedAt: new Date(Date.now() - Math.floor(Math.random() * 1800) * 1000).toISOString()
        }))
      },
      {
        name: 'email',
        stats: {
          pending: Math.floor(Math.random() * 50),
          processing: Math.floor(Math.random() * 20),
          completed: Math.floor(Math.random() * 500),
          failed: Math.floor(Math.random() * 5)
        },
        jobs: Array.from({ length: pagination.value.pageSize }, (_, i) => ({
          id: `EMAIL${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
          name: `邮件任务 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
          status: ['pending', 'processing', 'completed', 'failed'][Math.floor(Math.random() * 4)],
          attempts: Math.floor(Math.random() * 3),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 3600) * 1000).toISOString(),
          processedAt: new Date(Date.now() - Math.floor(Math.random() * 1800) * 1000).toISOString()
        }))
      }
    ];
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch queues:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchQueues();
};

// Lifecycle
onMounted(() => {
  fetchQueues();
});
</script>

<style scoped>
.ops-queue-view {
  padding: 20px;
}

.queue-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.queue-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

@media (max-width: 1024px) {
  .queue-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>