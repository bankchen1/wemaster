<template>
  <div class="earnings-settlement-view">
    <h2>{{ $t('earnings.settlements.title') }}</h2>
    <div class="settlement-header">
      <el-date-picker
        v-model="selectedPeriod"
        type="month"
        :placeholder="$t('earnings.settlements.selectPeriod')"
        @change="handlePeriodChange"
      />
      <el-button type="primary" @click="handleGenerateSettlement">
        {{ $t('earnings.settlements.actions.generate') }}
      </el-button>
      <el-button @click="handleExport">
        {{ $t('earnings.settlements.actions.export') }}
      </el-button>
    </div>
    <x-table
      :data="settlements"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('earnings.settlements.id')" width="180" />
      <el-table-column prop="tutor" :label="$t('earnings.settlements.tutor')" width="150" />
      <el-table-column prop="period" :label="$t('earnings.settlements.period')" width="120" />
      <el-table-column prop="grossAmount" :label="$t('earnings.settlements.grossAmount')" width="120">
        <template #default="{ row }">
          ¥{{ row.grossAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="taxAmount" :label="$t('earnings.settlements.taxAmount')" width="120">
        <template #default="{ row }">
          ¥{{ row.taxAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="netAmount" :label="$t('earnings.settlements.netAmount')" width="120">
        <template #default="{ row }">
          ¥{{ row.netAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="$t('earnings.settlements.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" :label="$t('earnings.settlements.createdAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleViewDetails(row)">
            {{ $t('common.view') }}
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="success"
            size="small"
            @click="handleSettle(row)"
          >
            {{ $t('earnings.settlements.actions.settle') }}
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
const settlements = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});
const selectedPeriod = ref(new Date());

// Methods
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    settled: 'success',
    paid: 'success',
    cancelled: 'danger'
  };
  return statusMap[status] || '';
};

const handlePeriodChange = (period) => {
  console.log('Period changed:', period);
  fetchSettlements();
};

const handleGenerateSettlement = () => {
  console.log('Generate settlement for period:', selectedPeriod.value);
};

const handleExport = () => {
  console.log('Export settlements');
};

const handleViewDetails = (settlement) => {
  console.log('View settlement details:', settlement);
};

const handleSettle = (settlement) => {
  console.log('Settle earnings:', settlement);
};

const fetchSettlements = async (params = {}) => {
  loading.value = true;
  try {
    // Mock data
    settlements.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `SETTLE${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      tutor: `导师 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      period: '2023-01',
      grossAmount: Math.floor(Math.random() * 10000) + 1000,
      taxAmount: Math.floor(Math.random() * 1000) + 100,
      netAmount: Math.floor(Math.random() * 9000) + 900,
      status: ['pending', 'settled', 'paid', 'cancelled'][Math.floor(Math.random() * 4)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch settlements:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchSettlements({ page, pageSize });
};

// Lifecycle
onMounted(() => {
  fetchSettlements({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.earnings-settlement-view {
  padding: 20px;
}

.settlement-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}
</style>