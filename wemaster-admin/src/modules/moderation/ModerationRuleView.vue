<template>
  <div class="moderation-rule-view">
    <h2>{{ $t('moderation.rules.title') }}</h2>
    <div class="rule-header">
      <el-button type="primary" @click="handleCreateRule">
        {{ $t('moderation.rules.actions.create') }}
      </el-button>
    </div>
    <x-table
      :data="rules"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('moderation.rules.id')" width="180" />
      <el-table-column prop="name" :label="$t('moderation.rules.name')" />
      <el-table-column prop="type" :label="$t('moderation.rules.type')" width="150" />
      <el-table-column prop="status" :label="$t('moderation.rules.status')" width="120">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="true"
            :inactive-value="false"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" :label="$t('moderation.rules.createdAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            {{ $t('common.edit') }}
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
const rules = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

// Methods
const handleCreateRule = () => {
  console.log('Create rule');
};

const handleEdit = (rule) => {
  console.log('Edit rule:', rule);
};

const handleDelete = (rule) => {
  console.log('Delete rule:', rule);
};

const handleStatusChange = (rule) => {
  console.log('Change rule status:', rule);
};

const fetchRules = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    rules.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `RULE${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `审核规则 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      type: ['关键词过滤', '频率限制', '设备指纹'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.5,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch rules:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchRules({ page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchRules({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.moderation-rule-view {
  padding: 20px;
}

.rule-header {
  margin-bottom: 20px;
}
</style>