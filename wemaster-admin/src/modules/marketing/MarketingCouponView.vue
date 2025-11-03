<template>
  <div class="marketing-coupon">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="coupons"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="优惠券ID" width="180" sortable="custom" />
      <el-table-column prop="name" label="名称" width="200" sortable="custom" />
      <el-table-column prop="type" label="类型" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="discount" label="折扣" width="120" sortable="custom" />
      <el-table-column prop="usageLimit" label="使用次数限制" width="120" sortable="custom" />
      <el-table-column prop="usedCount" label="已使用次数" width="120" sortable="custom" />
      <el-table-column prop="validityPeriod" label="有效期" width="200" sortable="custom" />
      <el-table-column prop="status" label="状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="warning" size="small" @click="handleDisable(row)" v-if="row.status === 'ACTIVE'">
            禁用
          </el-button>
          <el-button type="info" size="small" @click="handleEnable(row)" v-if="row.status === 'INACTIVE'">
            启用
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
import XFilter from '@/components/shared/XFilter.vue';
import XTable from '@/components/shared/XTable.vue';

// State
const coupons = ref([]);
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
    placeholder: '请输入优惠券名称'
  },
  {
    key: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    options: [
      { label: '满减', value: 'REDUCTION' },
      { label: '折扣', value: 'DISCOUNT' },
      { label: '免费', value: 'FREE' }
    ]
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '激活', value: 'ACTIVE' },
      { label: '未激活', value: 'INACTIVE' },
      { label: '已过期', value: 'EXPIRED' }
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
const fetchCoupons = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getMarketingCoupons(params);
    // coupons.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    coupons.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `COUPON${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `优惠券 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      type: ['REDUCTION', 'DISCOUNT', 'FREE'][i % 3],
      discount: ['¥10', '¥20', '8折', '9折', '免费'][i % 5],
      usageLimit: [1, 10, 100, 1000][i % 4],
      usedCount: Math.floor(Math.random() * 100),
      validityPeriod: `${new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()} - ${new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()}`,
      status: ['ACTIVE', 'INACTIVE', 'EXPIRED'][i % 3],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchCoupons({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchCoupons({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchCoupons({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (coupon) => {
  // Handle view coupon details
  console.log('View coupon:', coupon);
};

const handleEdit = (coupon) => {
  // Handle edit coupon
  console.log('Edit coupon:', coupon);
};

const handleDisable = (coupon) => {
  // Handle disable coupon
  console.log('Disable coupon:', coupon);
};

const handleEnable = (coupon) => {
  // Handle enable coupon
  console.log('Enable coupon:', coupon);
};

const handleDelete = (coupon) => {
  // Handle delete coupon
  console.log('Delete coupon:', coupon);
};

const getTypeTagType = (type) => {
  const types = {
    REDUCTION: 'success',
    DISCOUNT: 'warning',
    FREE: 'danger'
  };
  return types[type] || 'info';
};

const getStatusTagType = (status) => {
  const types = {
    ACTIVE: 'success',
    INACTIVE: 'info',
    EXPIRED: 'danger'
  };
  return types[status] || 'info';
};

// Lifecycle
onMounted(() => {
  fetchCoupons({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.marketing-coupon {
  padding: 20px;
}
</style>