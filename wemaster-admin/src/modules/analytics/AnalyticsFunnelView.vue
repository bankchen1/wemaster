<template>
  <div class="analytics-funnel-view">
    <h2>{{ $t('analytics.funnel.title') }}</h2>
    <div class="funnel-header">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        :start-placeholder="$t('analytics.funnel.startDate')"
        :end-placeholder="$t('analytics.funnel.endDate')"
        @change="handleDateRangeChange"
      />
      <el-select
        v-model="tenant"
        :placeholder="$t('analytics.funnel.selectTenant')"
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
    <div class="funnel-charts">
      <div class="chart-container">
        <h3>{{ $t('analytics.funnel.conversionFunnel') }}</h3>
        <div ref="funnelChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <h3>{{ $t('analytics.funnel.dropOffAnalysis') }}</h3>
        <div ref="dropOffChart" class="chart"></div>
      </div>
    </div>
    <x-table
      :data="funnelData"
      :loading="loading"
    >
      <el-table-column prop="step" :label="$t('analytics.funnel.step')" width="200" />
      <el-table-column prop="visitors" :label="$t('analytics.funnel.visitors')" width="150" />
      <el-table-column prop="conversionRate" :label="$t('analytics.funnel.conversionRate')" width="150" />
      <el-table-column prop="dropOffRate" :label="$t('analytics.funnel.dropOffRate')" width="150" />
    </x-table>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import XTable from '@/components/shared/XTable.vue';

// State
const funnelData = ref([]);
const loading = ref(false);
const dateRange = ref([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]);
const tenant = ref('wemaster');
const tenants = ref([
  { id: 'wemaster', name: 'WeMaster' },
  { id: 'tenant1', name: '租户1' },
  { id: 'tenant2', name: '租户2' }
]);
const funnelChart = ref(null);
const dropOffChart = ref(null);
let funnelChartInstance = null;
let dropOffChartInstance = null;

// Methods
const handleDateRangeChange = (range) => {
  console.log('Date range changed:', range);
  fetchFunnelData();
};

const handleTenantChange = (tenantId) => {
  console.log('Tenant changed:', tenantId);
  fetchFunnelData();
};

const fetchFunnelData = async () => {
  loading.value = true;
  try {
    // Mock data
    funnelData.value = [
      { step: '浏览首页', visitors: 10000, conversionRate: '100%', dropOffRate: '0%' },
      { step: '查看课程', visitors: 3000, conversionRate: '30%', dropOffRate: '70%' },
      { step: '加入购物车', visitors: 1500, conversionRate: '50%', dropOffRate: '50%' },
      { step: '进入结算', visitors: 1200, conversionRate: '80%', dropOffRate: '20%' },
      { step: '完成支付', visitors: 1000, conversionRate: '83.3%', dropOffRate: '16.7%' }
    ];
    
    // Update charts
    updateFunnelChart();
    updateDropOffChart();
  } catch (error) {
    console.error('Failed to fetch funnel data:', error);
  } finally {
    loading.value = false;
  }
};

const updateFunnelChart = () => {
  if (!funnelChart.value) return;
  
  if (!funnelChartInstance) {
    funnelChartInstance = echarts.init(funnelChart.value);
  }
  
  const option = {
    title: {
      text: '转化漏斗'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: '转化率',
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
          { value: 100, name: '浏览首页' },
          { value: 30, name: '查看课程' },
          { value: 15, name: '加入购物车' },
          { value: 12, name: '进入结算' },
          { value: 10, name: '完成支付' }
        ]
      }
    ]
  };
  
  funnelChartInstance.setOption(option);
};

const updateDropOffChart = () => {
  if (!dropOffChart.value) return;
  
  if (!dropOffChartInstance) {
    dropOffChartInstance = echarts.init(dropOffChart.value);
  }
  
  const option = {
    title: {
      text: '流失分析'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ['浏览首页', '查看课程', '加入购物车', '进入结算', '完成支付'],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '流失数量',
        type: 'bar',
        barWidth: '60%',
        data: [0, 7000, 1500, 300, 200]
      }
    ]
  };
  
  dropOffChartInstance.setOption(option);
};

// Lifecycle
onMounted(() => {
  fetchFunnelData();
});

onBeforeUnmount(() => {
  if (funnelChartInstance) {
    funnelChartInstance.dispose();
  }
  if (dropOffChartInstance) {
    dropOffChartInstance.dispose();
  }
});
</script>

<style scoped>
.analytics-funnel-view {
  padding: 20px;
}

.funnel-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.funnel-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
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
  .funnel-charts {
    grid-template-columns: 1fr;
  }
}
</style>