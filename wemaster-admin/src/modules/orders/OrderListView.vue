<template>
  <div class="order-list">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="orders"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="订单号" width="180" sortable="custom" />
      <el-table-column prop="tenant" label="租户" width="120" sortable="custom" />
      <el-table-column prop="user" label="用户" width="150" sortable="custom" />
      <el-table-column prop="amount" label="金额" width="120" sortable="custom" />
      <el-table-column prop="status" label="状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="paymentMethod" label="支付方式" width="120" sortable="custom" />
      <el-table-column prop="idempotencyKey" label="幂等键" width="180" sortable="custom" />
      <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import XFilter from '@/components/shared/XFilter.vue';
import XTable from '@/components/shared/XTable.vue';

// Router
const router = useRouter();

// State
const orders = ref([]);
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
    placeholder: '请输入订单号或用户信息'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '草稿', value: 'DRAFT' },
      { label: '支付中', value: 'PENDING' },
      { label: '已支付', value: 'PAID' },
      { label: '已完成', value: 'FULFILLED' },
      { label: '退款中', value: 'REFUNDING' },
      { label: '已退款', value: 'REFUNDED' },
      { label: '已失败', value: 'FAILED' }
    ]
  },
  {
    key: 'paymentMethod',
    label: '支付方式',
    type: 'select',
    placeholder: '请选择支付方式',
    options: [
      { label: '信用卡', value: 'CREDIT_CARD' },
      { label: '支付宝', value: 'ALIPAY' },
      { label: '微信支付', value: 'WECHAT_PAY' },
      { label: '银行转账', value: 'BANK_TRANSFER' }
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
const fetchOrders = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getOrders(params);
    // orders.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    orders.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `ORDER${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      tenant: `tenant${(i % 3) + 1}`,
      user: `User ${(i % 100) + 1}`,
      amount: `¥${(Math.random() * 1000).toFixed(2)}`,
      status: ['DRAFT', 'PENDING', 'PAID', 'FULFILLED', 'REFUNDING', 'REFUNDED', 'FAILED'][i % 7],
      paymentMethod: ['CREDIT_CARD', 'ALIPAY', 'WECHAT_PAY', 'BANK_TRANSFER'][i % 4],
      idempotencyKey: `IDEMP${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchOrders({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchOrders({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchOrders({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (order) => {
  router.push(`/orders/detail/${order.id}`);
};

const handleEdit = (order) => {
  // Handle edit order
  console.log('Edit order:', order);
};

const handleDelete = (order) => {
  // Handle delete order
  console.log('Delete order:', order);
};

const getStatusTagType = (status) => {
  const types = {
    DRAFT: 'info',
    PENDING: 'warning',
    PAID: 'success',
    FULFILLED: 'success',
    REFUNDING: 'primary',
    REFUNDED: 'danger',
    FAILED: 'danger'
  };
  return types[status] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchOrders({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.order-list {
  padding: 20px;
}
</style>