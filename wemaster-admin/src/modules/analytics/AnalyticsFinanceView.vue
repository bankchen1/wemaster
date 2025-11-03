<template>
  <div class="analytics-finance-view">
    <h2>{{ $t('analytics.finance.title') }}</h2>
    <div class="finance-header">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        :start-placeholder="$t('analytics.finance.startDate')"
        :end-placeholder="$t('analytics.finance.endDate')"
        @change="handleDateRangeChange"
      />
      <el-select
        v-model="tenant"
        :placeholder="$t('analytics.finance.selectTenant')"
        @change="handleTenantChange"
      >
        <el-option
          v-for="t in tenants"
          :key="t.id"
          :label="t.name"
          :value="t.id"
        />
      </el-select>
    </div>
    <div class="finance-kpis">
      <el-card class="kpi-card">
        <div class="kpi-title">{{ $t('analytics.finance.gmv') }}</div>
        <div class="kpi-value">¥{{ financeData.gmv }}</div>
        <div class="kpi-change" :class="financeData.gmvChange > 0 ? 'positive' : 'negative'">
          {{ financeData.gmvChange > 0 ? '↑' : '↓' }} {{ Math.abs(financeData.gmvChange) }}%
        </div>
      </el-card>
      <el-card class="kpi-card">
        <div class="kpi-title">{{ $t('analytics.finance.mrr') }}</div>
        <div class="kpi-value">¥{{ financeData.mrr }}</div>
        <div class="kpi-change" :class="financeData.mrrChange > 0 ? 'positive' : 'negative'">
          {{ financeData.mrrChange > 0 ? '↑' : '↓' }} {{ Math.abs(financeData.mrrChange) }}%
        </div>
      </el-card>
      <el-card class="kpi-card">
        <div class="kpi-title">{{ $t('analytics.finance.arpu') }}</div>
        <div class="kpi-value">¥{{ financeData.arpu }}</div>
        <div class="kpi-change" :class="financeData.arpuChange > 0 ? 'positive' : 'negative'">
          {{ financeData.arpuChange > 0 ? '↑' : '↓' }} {{ Math.abs(financeData.arpuChange) }}%
        </div>
      </el-card>
      <el-card class="kpi-card">
        <div class="kpi-title">{{ $t('analytics.finance.refundRate') }}</div>
        <div class="kpi-value">{{ financeData.refundRate }}%</div>
        <div class="kpi-change" :class="financeData.refundRateChange > 0 ? 'negative' : 'positive'">
          {{ financeData.refundRateChange > 0 ? '↑' : '↓' }} {{ Math.abs(financeData.refundRateChange) }}%
        </div>
      </el-card>
    </div>
    <div class="finance-charts">
      <div class="chart-container">
        <h3>{{ $t('analytics.finance.revenueTrend') }}</h3>
        <div ref="revenueChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <h3>{{ $t('analytics.finance.paymentMethod') }}</h3>
        <div ref="paymentMethodChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

// State
const dateRange = ref([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]);
const tenant = ref('wemaster');
const tenants = ref([
  { id: 'wemaster', name: 'WeMaster' },
  { id: 'tenant1', name: '租户1' },
  { id: 'tenant2', name: '租户2' }
]);
const financeData = ref({
  gmv: '1,234,567',
  gmvChange: 12.5,
  mrr: '234,567',
  mrrChange: 8.3,
  arpu: '123',
  arpuChange: 5.2,
  refundRate: 3.2,
  refundRateChange: -1.2
});
const revenueChart = ref(null);
const paymentMethodChart = ref(null);
let revenueChartInstance = null;
let paymentMethodChartInstance = null;

// Methods
const handleDateRangeChange = (range) => {
  console.log('Date range changed:', range);
  fetchFinanceData();
};

const handleTenantChange = (tenantId) => {
  console.log('Tenant changed:', tenantId);
  fetchFinanceData();
};

const fetchFinanceData = async () => {
  // Mock data update
  financeData.value = {
    gmv: Math.floor(Math.random() * 1000000 + 500000).toLocaleString(),
    gmvChange: (Math.random() * 20 - 5).toFixed(1),
    mrr: Math.floor(Math.random() * 200000 + 100000).toLocaleString(),
    mrrChange: (Math.random() * 15 - 5).toFixed(1),
    arpu: Math.floor(Math.random() * 200 + 50),
    arpuChange: (Math.random() * 10 - 5).toFixed(1),
    refundRate: (Math.random() * 5).toFixed(1),
    refundRateChange: (Math.random() * 3 - 1.5).toFixed(1)
  };
  
  // Update charts
  updateRevenueChart();
  updatePaymentMethodChart();
};

const updateRevenueChart = () => {
  if (!revenueChart.value) return;
  
  if (!revenueChartInstance) {
    revenueChartInstance = echarts.init(revenueChart.value);
  }
  
  const option = {
    title: {
      text: '收入趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['GMV', '净收入']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'GMV',
        type: 'line',
        stack: '总量',
        data: [120000, 132000, 101000, 134000, 90000, 230000, 210000, 180000, 200000, 190000, 220000, 250000]
      },
      {
        name: '净收入',
        type: 'line',
        stack: '总量',
        data: [80000, 90000, 70000, 95000, 60000, 150000, 140000, 120000, 130000, 125000, 145000, 160000]
      }
    ]
  };
  
  revenueChartInstance.setOption(option);
};

const updatePaymentMethodChart = () => {
  if (!paymentMethodChart.value) return;
  
  if (!paymentMethodChartInstance) {
    paymentMethodChartInstance = echarts.init(paymentMethodChart.value);
  }
  
  const option = {
    title: {
      text: '支付方式分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '支付方式',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '支付宝' },
          { value: 735, name: '微信支付' },
          { value: 580, name: '银行卡' },
          { value: 484, name: 'Stripe' },
          { value: 300, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  paymentMethodChartInstance.setOption(option);
};

// Lifecycle
onMounted(() => {
  fetchFinanceData();
});

onBeforeUnmount(() => {
  if (revenueChartInstance) {
    revenueChartInstance.dispose();
  }
  if (paymentMethodChartInstance) {
    paymentMethodChartInstance.dispose();
  }
});
</script>

<style scoped>
.analytics-finance-view {
  padding: 20px;
}

.finance-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.finance-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.kpi-card {
  padding: 20px;
  text-align: center;
}

.kpi-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.kpi-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.kpi-change {
  font-size: 14px;
}

.kpi-change.positive {
  color: var(--color-success);
}

.kpi-change.negative {
  color: var(--color-danger);
}

.finance-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-container {
  background: var(--bg-container);
  border-radius: var(--border-radius-base);
  padding: 20px;
  box-shadow: var(--shadow-base);
}

.chart {
  width: 100%;
  height: 400px;
}

@media (max-width: 1024px) {
  .finance-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .finance-charts {
    grid-template-columns: 1fr;
  }
}
</style>