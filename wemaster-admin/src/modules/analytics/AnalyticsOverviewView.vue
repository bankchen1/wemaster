<template>
  <div class="analytics-overview">
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
                <User />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">12,345</div>
              <div class="stat-label">活跃用户</div>
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
                <TrendCharts />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥1,234,567</div>
              <div class="stat-label">总交易额</div>
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
              <div class="stat-value">5,678</div>
              <div class="stat-label">订单数</div>
              <div class="stat-change text-success">+5.7% from last month</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: 'var(--color-info-light-9)' }">
              <el-icon :size="24" color="var(--color-info)">
                <Wallet />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">2.3%</div>
              <div class="stat-label">退款率</div>
              <div class="stat-change text-danger">-0.5% from last month</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
            </div>
          </template>
          <div ref="userGrowthChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>收入趋势</span>
            </div>
          </template>
          <div ref="revenueChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>转化漏斗</span>
            </div>
          </template>
          <div ref="conversionFunnelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户地域分布</span>
            </div>
          </template>
          <div ref="geographicChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import {
  User,
  TrendCharts,
  Document,
  Wallet
} from '@element-plus/icons-vue';
import XFilter from '@/components/shared/XFilter.vue';

// State
const filterModel = ref({});
const filterFields = ref([
  {
    key: 'dateRange',
    label: '时间范围',
    type: 'date-range',
    placeholder: '请选择时间范围',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  },
  {
    key: 'tenant',
    label: '租户',
    type: 'select',
    placeholder: '请选择租户',
    options: [
      { label: 'WeMaster', value: 'wemaster' },
      { label: 'Tenant 1', value: 'tenant1' },
      { label: 'Tenant 2', value: 'tenant2' }
    ]
  }
]);

const userGrowthChartRef = ref(null);
const revenueChartRef = ref(null);
const conversionFunnelChartRef = ref(null);
const geographicChartRef = ref(null);

let userGrowthChart = null;
let revenueChart = null;
let conversionFunnelChart = null;
let geographicChart = null;

// Methods
const handleSearch = (filters) => {
  filterModel.value = filters;
  // In a real implementation, you would fetch data based on filters
  console.log('Search with filters:', filters);
};

const handleReset = () => {
  filterModel.value = {};
  // In a real implementation, you would reset data
  console.log('Reset filters');
};

// Chart initialization
const initCharts = () => {
  // User growth chart
  if (userGrowthChartRef.value) {
    userGrowthChart = echarts.init(userGrowthChartRef.value);
    userGrowthChart.setOption({
      title: {
        text: '用户增长趋势'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [1200, 1500, 1800, 2200, 2500, 2800],
          type: 'line',
          smooth: true
        }
      ]
    });
  }

  // Revenue chart
  if (revenueChartRef.value) {
    revenueChart = echarts.init(revenueChartRef.value);
    revenueChart.setOption({
      title: {
        text: '收入趋势'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['收入', '支出']
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: [12000, 15000, 18000, 22000, 25000, 28000]
        },
        {
          name: '支出',
          type: 'bar',
          data: [5000, 6000, 7000, 8000, 9000, 10000]
        }
      ]
    });
  }

  // Conversion funnel chart
  if (conversionFunnelChartRef.value) {
    conversionFunnelChart = echarts.init(conversionFunnelChartRef.value);
    conversionFunnelChart.setOption({
      title: {
        text: '转化漏斗'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside'
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: {
              fontSize: 20
            }
          },
          data: [
            { value: 100, name: '浏览' },
            { value: 80, name: '点击' },
            { value: 60, name: '下单' },
            { value: 40, name: '支付' },
            { value: 20, name: '完成' }
          ]
        }
      ]
    });
  }

  // Geographic distribution chart
  if (geographicChartRef.value) {
    geographicChart = echarts.init(geographicChartRef.value);
    geographicChart.setOption({
      title: {
        text: '用户地域分布'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '用户分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 35, name: '北京' },
            { value: 25, name: '上海' },
            { value: 20, name: '广州' },
            { value: 15, name: '深圳' },
            { value: 5, name: '其他' }
          ]
        }
      ]
    });
  }
};

// Lifecycle
onMounted(() => {
  initCharts();
  
  // Add resize listener
  window.addEventListener('resize', () => {
    if (userGrowthChart) userGrowthChart.resize();
    if (revenueChart) revenueChart.resize();
    if (conversionFunnelChart) conversionFunnelChart.resize();
    if (geographicChart) geographicChart.resize();
  });
});

onBeforeUnmount(() => {
  // Clean up charts
  if (userGrowthChart) userGrowthChart.dispose();
  if (revenueChart) revenueChart.dispose();
  if (conversionFunnelChart) conversionFunnelChart.dispose();
  if (geographicChart) geographicChart.dispose();
});
</script>

<style scoped>
.analytics-overview {
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

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: var(--border-radius-base);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>