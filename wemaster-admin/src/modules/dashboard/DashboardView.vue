<template>
  <div class="dashboard">
    <el-tabs v-model="activeTab" class="dashboard-tabs">
      <el-tab-pane label="Overview" name="overview">
        <div class="kpi-grid">
          <el-card class="kpi-card" v-for="kpi in kpis" :key="kpi.key">
            <div class="kpi-content">
              <div class="kpi-icon" :style="{ backgroundColor: kpi.iconBg }">
                <el-icon :size="24" :color="kpi.iconColor">
                  <component :is="kpi.icon" />
                </el-icon>
              </div>
              <div class="kpi-info">
                <div class="kpi-value">{{ kpi.value }}</div>
                <div class="kpi-label">{{ kpi.label }}</div>
                <div class="kpi-change" :class="kpi.changeColor">
                  {{ kpi.change }}
                </div>
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="charts-grid">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>租户维度折线图</span>
              </div>
            </template>
            <div ref="tenantChartRef" class="chart-container"></div>
          </el-card>
          
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>转化漏斗</span>
              </div>
            </template>
            <div ref="funnelChartRef" class="chart-container"></div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="Ops" name="ops">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>实时告警</span>
            </div>
          </template>
          <el-table :data="alerts" style="width: 100%">
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="message" label="消息" />
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleAlertAction(row)">
                  处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="Finance" name="finance">
        <div class="finance-grid">
          <el-card class="finance-card">
            <template #header>
              <div class="card-header">
                <span>财务概览</span>
              </div>
            </template>
            <div ref="financeChartRef" class="chart-container"></div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import {
  User,
  UserFilled,
  Calendar,
  TrendCharts,
  DataAnalysis
} from '@element-plus/icons-vue';

// State
const activeTab = ref('overview');
const tenantChartRef = ref(null);
const funnelChartRef = ref(null);
const financeChartRef = ref(null);
let tenantChart = null;
let funnelChart = null;
let financeChart = null;

// Mock data
const kpis = ref([
  {
    key: 'activeUsers',
    icon: User,
    iconBg: 'var(--color-primary-light-9)',
    iconColor: 'var(--color-primary)',
    label: '活跃用户',
    value: '12,345',
    change: '+12.5% from last month',
    changeColor: 'text-success'
  },
  {
    key: 'gmv',
    icon: TrendCharts,
    iconBg: 'var(--color-success-light-9)',
    iconColor: 'var(--color-success)',
    label: '总交易额',
    value: '¥1,234,567',
    change: '+8.2% from last month',
    changeColor: 'text-success'
  },
  {
    key: 'orders',
    icon: Calendar,
    iconBg: 'var(--color-warning-light-9)',
    iconColor: 'var(--color-warning)',
    label: '订单数',
    value: '5,678',
    change: '+5.7% from last month',
    changeColor: 'text-success'
  },
  {
    key: 'refundRate',
    icon: DataAnalysis,
    iconBg: 'var(--color-danger-light-9)',
    iconColor: 'var(--color-danger)',
    label: '退款率',
    value: '2.3%',
    change: '-0.5% from last month',
    changeColor: 'text-success'
  },
  {
    key: 'subscriptions',
    icon: UserFilled,
    iconBg: 'var(--color-info-light-9)',
    iconColor: 'var(--color-info)',
    label: '订阅收入',
    value: '¥345,678',
    change: '+15.3% from last month',
    changeColor: 'text-success'
  }
]);

const alerts = ref([
  {
    id: 1,
    type: '支付失败',
    message: 'Stripe 支付失败: card_declined',
    time: '2023-05-15 14:30:22'
  },
  {
    id: 2,
    type: '队列积压',
    message: '支付处理队列积压超过 1000 项',
    time: '2023-05-15 14:25:17'
  },
  {
    id: 3,
    type: 'Webhook 错误',
    message: 'Webhook 回调失败: timeout',
    time: '2023-05-15 14:20:45'
  }
]);

// Methods
const handleAlertAction = (alert) => {
  console.log('处理告警:', alert);
  // In a real implementation, you would call an API to handle the alert
};

// Chart initialization
const initCharts = () => {
  // Tenant chart
  if (tenantChartRef.value) {
    tenantChart = echarts.init(tenantChartRef.value);
    tenantChart.setOption({
      title: {
        text: '租户活跃度趋势'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: 'line',
          smooth: true
        }
      ]
    });
  }

  // Funnel chart
  if (funnelChartRef.value) {
    funnelChart = echarts.init(funnelChartRef.value);
    funnelChart.setOption({
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

  // Finance chart
  if (financeChartRef.value) {
    financeChart = echarts.init(financeChartRef.value);
    financeChart.setOption({
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
};

// Lifecycle
onMounted(() => {
  initCharts();
  
  // Add resize listener
  window.addEventListener('resize', () => {
    if (tenantChart) tenantChart.resize();
    if (funnelChart) funnelChart.resize();
    if (financeChart) financeChart.resize();
  });
});

onBeforeUnmount(() => {
  // Clean up charts
  if (tenantChart) tenantChart.dispose();
  if (funnelChart) funnelChart.dispose();
  if (financeChart) financeChart.dispose();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-tabs {
  background-color: var(--bg-container);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-base);
  padding: 20px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card {
  border-radius: var(--border-radius-base);
}

.kpi-content {
  display: flex;
  align-items: center;
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.kpi-info {
  flex: 1;
}

.kpi-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.kpi-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.kpi-change {
  font-size: 12px;
}

.text-success {
  color: var(--color-success);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
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

.finance-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.finance-card {
  border-radius: var(--border-radius-base);
}
</style>