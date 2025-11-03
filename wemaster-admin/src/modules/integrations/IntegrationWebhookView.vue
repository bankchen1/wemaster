<template>
  <div class="integration-webhook-view">
    <h2>{{ $t('integrations.webhooks.title') }}</h2>
    <div class="webhook-header">
      <el-button type="primary" @click="handleCreateWebhook">
        {{ $t('integrations.webhooks.actions.create') }}
      </el-button>
    </div>
    <x-table
      :data="webhooks"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('integrations.webhooks.id')" width="180" />
      <el-table-column prop="name" :label="$t('integrations.webhooks.name')" />
      <el-table-column prop="targetUrl" :label="$t('integrations.webhooks.targetUrl')" />
      <el-table-column prop="events" :label="$t('integrations.webhooks.events')" width="200" />
      <el-table-column prop="status" :label="$t('integrations.webhooks.status')" width="120">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="true"
            :inactive-value="false"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" :label="$t('integrations.webhooks.createdAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            {{ $t('common.edit') }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            {{ $t('common.delete') }}
          </el-button>
          <el-button type="warning" size="small" @click="handleReplay(row)">
            {{ $t('integrations.webhooks.actions.replay') }}
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
const webhooks = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

// Methods
const handleCreateWebhook = () => {
  console.log('Create webhook');
};

const handleEdit = (webhook) => {
  console.log('Edit webhook:', webhook);
};

const handleDelete = (webhook) => {
  console.log('Delete webhook:', webhook);
};

const handleStatusChange = (webhook) => {
  console.log('Change webhook status:', webhook);
};

const handleReplay = (webhook) => {
  console.log('Replay webhook:', webhook);
};

const fetchWebhooks = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    webhooks.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `WEBHOOK${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `Webhook ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      targetUrl: `https://example.com/webhooks/${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      events: ['order.created', 'payment.completed', 'user.updated'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.5,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchWebhooks({ page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchWebhooks({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.integration-webhook-view {
  padding: 20px;
}

.webhook-header {
  margin-bottom: 20px;
}
</style>