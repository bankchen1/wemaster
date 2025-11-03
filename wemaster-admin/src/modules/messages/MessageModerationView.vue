<template>
  <div class="message-moderation">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="messages"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="消息ID" width="180" sortable="custom" />
      <el-table-column prop="sender" label="发送者" width="150" sortable="custom" />
      <el-table-column prop="receiver" label="接收者" width="150" sortable="custom" />
      <el-table-column prop="content" label="内容" width="300" show-overflow-tooltip />
      <el-table-column prop="sensitiveWords" label="敏感词" width="150" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="violationType" label="违规类型" width="150" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getViolationTagType(row.violationType)">
            {{ row.violationType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleApprove(row)" v-if="row.status === 'PENDING'">
            通过
          </el-button>
          <el-button type="danger" size="small" @click="handleReject(row)" v-if="row.status === 'PENDING'">
            拒绝
          </el-button>
          <el-button type="warning" size="small" @click="handleBlacklist(row)" v-if="row.status === 'REJECTED'">
            加入黑名单
          </el-button>
        </template>
      </el-table-column>
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XFilter from '@/components/shared/XFilter.vue';
import XTable from '@/components/shared/XTable.vue';

// State
const messages = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

const filterModel = ref({});
const filterFields = ref([
  {
    key: 'keyword',
    label: '关键词',
    type: 'text',
    placeholder: '请输入消息内容'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '待审核', value: 'PENDING' },
      { label: '已通过', value: 'APPROVED' },
      { label: '已拒绝', value: 'REJECTED' }
    ]
  },
  {
    key: 'violationType',
    label: '违规类型',
    type: 'select',
    placeholder: '请选择违规类型',
    options: [
      { label: '色情', value: 'PORNOGRAPHY' },
      { label: '政治', value: 'POLITICAL' },
      { label: '广告', value: 'ADVERTISING' },
      { label: '人身攻击', value: 'PERSONAL_ATTACK' },
      { label: '其他', value: 'OTHER' }
    ]
  },
  {
    key: 'dateRange',
    label: '创建时间',
    type: 'date-range',
    placeholder: '请选择创建时间',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]);

// Methods
const fetchMessages = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getMessageModerationQueue(params);
    // messages.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    messages.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `MSG${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      sender: `User ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      receiver: `User ${Math.floor(Math.random() * 100) + 1}`,
      content: `这是一条测试消息，内容为：${Math.random().toString(36).substring(2, 15)}`,
      sensitiveWords: ['敏感词1', '敏感词2', ''][i % 3],
      status: ['PENDING', 'APPROVED', 'REJECTED'][i % 3],
      violationType: ['PORNOGRAPHY', 'POLITICAL', 'ADVERTISING', 'PERSONAL_ATTACK', 'OTHER'][i % 5],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch messages:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchMessages({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchMessages({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchMessages({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (message) => {
  // Handle view message details
  console.log('View message:', message);
};

const handleApprove = (message) => {
  // Handle approve message
  console.log('Approve message:', message);
};

const handleReject = (message) => {
  // Handle reject message
  console.log('Reject message:', message);
};

const handleBlacklist = (message) => {
  // Handle add sender to blacklist
  console.log('Blacklist sender:', message);
};

const getStatusTagType = (status) => {
  const types = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  };
  return types[status] || 'info';
};

const getViolationTagType = (violationType) => {
  const types = {
    PORNOGRAPHY: 'danger',
    POLITICAL: 'warning',
    ADVERTISING: 'info',
    PERSONAL_ATTACK: 'danger',
    OTHER: 'info'
  };
  return types[violationType] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchMessages({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.message-moderation {
  padding: 20px;
}
</style>