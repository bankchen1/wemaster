<template>
  <div class="earnings-overview">
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: 'var(--color-primary-light-9)' }">
              <el-icon :size="24" color="var(--color-primary)">
                <TrendCharts />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥123,456.78</div>
              <div class="stat-label">总收益</div>
              <div class="stat-change text-success">+12.5% from last month</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: 'var(--color-success-light-9)' }">
              <el-icon :size="24" color="var(--color-success)">
                <Wallet />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥98,765.43</div>
              <div class="stat-label">已结算</div>
              <div class="stat-change text-success">+8.2% from last month</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: 'var(--color-warning-light-9)' }">
              <el-icon :size="24" color="var(--color-warning)">
                <Document />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥24,691.35</div>
              <div class="stat-label">待结算</div>
              <div class="stat-change text-danger">-2.1% from last month</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: 'var(--color-info-light-9)' }">
              <el-icon :size="24" color="var(--color-info)">
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">1,234</div>
              <div class="stat-label">活跃导师</div>
              <div class="stat-change text-success">+5.7% from last month</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>收益趋势</span>
        </div>
      </template>
      <div ref="earningsChartRef" class="chart-container"></div>
    </el-card>
    
    <x-table
      :data="earnings"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="结算单ID" width="180" sortable="custom" />
      <el-table-column prop="tutor" label="导师" width="150" sortable="custom" />
      <el-table-column prop="period" label="结算周期" width="150" sortable="custom" />
      <el-table-column prop="amount" label="结算金额" width="120" sortable="custom" />
      <el-table-column prop="tax" label="税费" width="100" sortable="custom" />
      <el-table-column prop="netAmount" label="净收益" width="120" sortable="custom" />
      <el-table-column prop="status" label="状态" width="120" sortable="custom">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button type="success" size="small" @click="handleSettle(row)" v-if="row.status === 'PENDING'">
            结算
          </el-button>
          <el-button type="warning" size="small" @click="handlePayout(row)" v-if="row.status === 'SETTLED'">
            打款
          </el-button>
        </template>
      </el-table-column>
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import {
  TrendCharts,
  Wallet,
  Document,
  User
} from '@element-plus/icons-vue';
import XFilter from '@/components/shared/XFilter.vue';
import XTable from '@/components/shared/XTable.vue';

// State
const earnings = ref([]);
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
    placeholder: '请输入导师姓名'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '待结算', value: 'PENDING' },
      { label: '已结算', value: 'SETTLED' },
      { label: '已打款', value: 'PAID' },
      { label: '已拒绝', value: 'REJECTED' }
    ]
  },
  {
    key: 'dateRange',
    label: '结算周期',
    type: 'date-range',
    placeholder: '请选择结算周期',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]);

const earningsChartRef = ref(null);
let earningsChart = null;

// Methods
const fetchEarnings = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getEarnings(params);
    // earnings.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    earnings.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `SETTLE${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      tutor: `Tutor ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      period: `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`,
      amount: `¥${(Math.random() * 10000).toFixed(2)}`,
      tax: `¥${(Math.random() * 1000).toFixed(2)}`,
      netAmount: `¥${(Math.random() * 9000).toFixed(2)}`,
      status: ['PENDING', 'SETTLED', 'PAID', 'REJECTED'][i % 4],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch earnings:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = (filters) => {
  filterModel.value = filters;
  pagination.value.currentPage = 1;
  fetchEarnings({ ...filters, page: 1, pageSize: pagination.value.pageSize });
};

const handleReset = () => {
  filterModel.value = {};
  pagination.value.currentPage = 1;
  fetchEarnings({ page: 1, pageSize: pagination.value.pageSize });
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchEarnings({ ...filterModel.value, page, pageSize });
};

const handleSortChange = (sort) => {
  // Handle sort change
  console.log('Sort changed:', sort);
};

const handleView = (earning) => {
  // Handle view earning details
  console.log('View earning:', earning);
};

const handleSettle = (earning) => {
  // Handle settle earning
  console.log('Settle earning:', earning);
};

const handlePayout = (earning) => {
  // Handle payout earning
  console.log('Payout earning:', earning);
};

const getStatusTagType = (status) => {
  const types = {
    PENDING: 'warning',
    SETTLED: 'primary',
    PAID: 'success',
    REJECTED: 'danger'
  };
  return types[status] || 'info';
};

// Chart initialization
const initChart = () => {
  if (earningsChartRef.value) {
    earningsChart = echarts.init(earningsChartRef.value);
    earningsChart.setOption({
      title: {
        text: '月度收益趋势'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '总收益',
          type: 'line',
          data: [12000, 15000, 18000, 22000, 25000, 28000, 30000, 32000, 35000, 38000, 40000, 42000],
          smooth: true
        },
        {
          name: '净收益',
          type: 'line',
          data: [10000, 12500, 15000, 18000, 21000, 24000, 26000, 28000, 31000, 34000, 36000, 38000],
          smooth: true
        }
      ]
    });
  }
};

// Lifecycle
onMounted(() => {
  fetchEarnings({ page: 1, pageSize: pagination.value.pageSize });
  initChart();
  
  // Add resize listener
  window.addEventListener('resize', () => {
    if (earningsChart) earningsChart.resize();
  });
});

onBeforeUnmount(() => {
  // Clean up chart
  if (earningsChart) earningsChart.dispose();
});
</script>

<style scoped>
.earnings-overview {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: var(--border-radius-base);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
}

.text-success {
  color: var(--color-success);
}

.text-danger {
  color: var(--color-danger);
}

.chart-card {
  border-radius: var(--border-radius-base);
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>