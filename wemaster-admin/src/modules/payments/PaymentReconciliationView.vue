<template>
  <div class="payment-reconciliation-view">
    <h2>{{ $t('payments.reconciliation.title') }}</h2>
    <div class="reconciliation-header">
      <el-date-picker
        v-model="selectedDate"
        type="date"
        :placeholder="$t('payments.reconciliation.selectDate')"
        @change="handleDateChange"
      />
      <el-button type="primary" @click="handleReconcile">
        {{ $t('payments.reconciliation.actions.reconcile') }}
      </el-button>
      <el-button @click="handleExport">
        {{ $t('payments.reconciliation.actions.export') }}
      </el-button>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('payments.reconciliation.tabs.discrepancies')" name="discrepancies">
        <x-table
          :data="discrepancies"
          :loading="loading"
        >
          <el-table-column prop="id" :label="$t('payments.reconciliation.discrepancies.id')" width="180" />
          <el-table-column prop="orderId" :label="$t('payments.reconciliation.discrepancies.orderId')" width="180" />
          <el-table-column prop="systemAmount" :label="$t('payments.reconciliation.discrepancies.systemAmount')" width="120">
            <template #default="{ row }">
              ¥{{ row.systemAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="stripeAmount" :label="$t('payments.reconciliation.discrepancies.stripeAmount')" width="120">
            <template #default="{ row }">
              ¥{{ row.stripeAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="difference" :label="$t('payments.reconciliation.discrepancies.difference')" width="120">
            <template #default="{ row }">
              <span :class="{ 'text-danger': row.difference !== 0 }">
                ¥{{ row.difference }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="$t('payments.reconciliation.discrepancies.status')" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.actions')" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleResolve(row)">
                {{ $t('payments.reconciliation.actions.resolve') }}
              </el-button>
            </template>
          </el-table-column>
        </x-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('payments.reconciliation.tabs.statement')" name="statement">
        <x-table
          :data="statement"
          :loading="loading"
        >
          <el-table-column prop="id" :label="$t('payments.reconciliation.statement.id')" width="180" />
          <el-table-column prop="transactionId" :label="$t('payments.reconciliation.statement.transactionId')" width="180" />
          <el-table-column prop="type" :label="$t('payments.reconciliation.statement.type')" width="120" />
          <el-table-column prop="amount" :label="$t('payments.reconciliation.statement.amount')" width="120">
            <template #default="{ row }">
              ¥{{ row.amount }}
            </template>
          </el-table-column>
          <el-table-column prop="fee" :label="$t('payments.reconciliation.statement.fee')" width="120">
            <template #default="{ row }">
              ¥{{ row.fee }}
            </template>
          </el-table-column>
          <el-table-column prop="netAmount" :label="$t('payments.reconciliation.statement.netAmount')" width="120">
            <template #default="{ row }">
              ¥{{ row.netAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="date" :label="$t('payments.reconciliation.statement.date')" width="180" />
        </x-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XTable from '@/components/shared/XTable.vue';

// State
const activeTab = ref('discrepancies');
const selectedDate = ref(new Date());
const discrepancies = ref([]);
const statement = ref([]);
const loading = ref(false);

// Methods
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    resolved: 'success',
    ignored: 'info'
  };
  return statusMap[status] || '';
};

const handleDateChange = (date) => {
  console.log('Date changed:', date);
  fetchDiscrepancies();
  fetchStatement();
};

const handleReconcile = () => {
  console.log('Reconcile for date:', selectedDate.value);
};

const handleExport = () => {
  console.log('Export reconciliation report');
};

const handleResolve = (discrepancy) => {
  console.log('Resolve discrepancy:', discrepancy);
};

const fetchDiscrepancies = async () => {
  loading.value = true;
  try {
    // Mock data
    discrepancies.value = Array.from({ length: 10 }, (_, i) => ({
      id: `DISC${i + 1}`,
      orderId: `ORDER${Math.floor(Math.random() * 1000)}`,
      systemAmount: Math.floor(Math.random() * 1000) + 100,
      stripeAmount: Math.floor(Math.random() * 1000) + 100,
      difference: Math.floor(Math.random() * 100) - 50,
      status: ['pending', 'resolved', 'ignored'][Math.floor(Math.random() * 3)],
    }));
  } catch (error) {
    console.error('Failed to fetch discrepancies:', error);
  } finally {
    loading.value = false;
  }
};

const fetchStatement = async () => {
  try {
    // Mock data
    statement.value = Array.from({ length: 20 }, (_, i) => ({
      id: `STMT${i + 1}`,
      transactionId: `TXN${Math.floor(Math.random() * 10000)}`,
      type: ['charge', 'refund', 'payout'][Math.floor(Math.random() * 3)],
      amount: Math.floor(Math.random() * 1000) + 100,
      fee: Math.floor(Math.random() * 50),
      netAmount: Math.floor(Math.random() * 1000) + 50,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    }));
  } catch (error) {
    console.error('Failed to fetch statement:', error);
  }
};

// Lifecycle
onMounted(() => {
  fetchDiscrepancies();
  fetchStatement();
});
</script>

<style scoped>
.payment-reconciliation-view {
  padding: 20px;
}

.reconciliation-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.text-danger {
  color: var(--color-danger);
}
</style>