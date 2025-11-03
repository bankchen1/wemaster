<template>
  <div class="order-detail-view">
    <h2>{{ $t('orders.detail.title') }}</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('orders.detail.tabs.timeline')" name="timeline">
        <el-steps :active="getActiveStep" finish-status="success">
          <el-step :title="$t('orders.detail.timeline.draft')" />
          <el-step :title="$t('orders.detail.timeline.pending')" />
          <el-step :title="$t('orders.detail.timeline.paid')" />
          <el-step :title="$t('orders.detail.timeline.fulfilled')" />
        </el-steps>
        <div class="order-summary-card">
          <h3>{{ $t('orders.detail.summary.title') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('orders.detail.fields.id')">
              {{ order.id }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('orders.detail.fields.status')">
              <el-tag :type="getStatusType(order.status)">
                {{ order.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('orders.detail.fields.amount')">
              ¥{{ order.amount }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('orders.detail.fields.tenant')">
              {{ order.tenant }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('orders.detail.fields.user')">
              {{ order.user }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('orders.detail.fields.createdAt')">
              {{ order.createdAt }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('orders.detail.tabs.items')" name="items">
        <x-table
          :data="orderItems"
          :loading="loading"
        >
          <el-table-column prop="id" :label="$t('orders.detail.items.id')" width="180" />
          <el-table-column prop="name" :label="$t('orders.detail.items.name')" />
          <el-table-column prop="quantity" :label="$t('orders.detail.items.quantity')" width="120" />
          <el-table-column prop="unitPrice" :label="$t('orders.detail.items.unitPrice')" width="120" />
          <el-table-column prop="totalPrice" :label="$t('orders.detail.items.totalPrice')" width="120" />
        </x-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('orders.detail.tabs.payment')" name="payment">
        <div class="payment-status-card">
          <h3>{{ $t('orders.detail.payment.title') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('orders.detail.payment.status')">
              <el-tag :type="getPaymentStatusType(order.paymentStatus)">
                {{ order.paymentStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('orders.detail.payment.method')">
              {{ order.paymentMethod }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('orders.detail.payment.transactionId')">
              {{ order.transactionId }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('orders.detail.payment.chargeId')">
              {{ order.chargeId }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <el-button type="primary" @click="handleRetryPayment" style="margin-top: 20px;">
          {{ $t('orders.detail.actions.retryPayment') }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane :label="$t('orders.detail.tabs.refund')" name="refund">
        <el-button type="primary" @click="handleCreateRefund">
          {{ $t('orders.detail.actions.createRefund') }}
        </el-button>
        <x-table
          :data="refunds"
          :loading="loading"
          style="margin-top: 20px;"
        >
          <el-table-column prop="id" :label="$t('orders.detail.refunds.id')" width="180" />
          <el-table-column prop="amount" :label="$t('orders.detail.refunds.amount')" width="120" />
          <el-table-column prop="reason" :label="$t('orders.detail.refunds.reason')" />
          <el-table-column prop="status" :label="$t('orders.detail.refunds.status')" width="120">
            <template #default="{ row }">
              <el-tag :type="getRefundStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" :label="$t('orders.detail.refunds.createdAt')" width="180" />
        </x-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('orders.detail.tabs.invoice')" name="invoice">
        <el-button type="primary" @click="handleIssueInvoice">
          {{ $t('orders.detail.actions.issueInvoice') }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane :label="$t('orders.detail.tabs.audit')" name="audit">
        <x-table
          :data="auditLogs"
          :loading="loading"
        >
          <el-table-column prop="id" :label="$t('orders.detail.audit.id')" width="180" />
          <el-table-column prop="action" :label="$t('orders.detail.audit.action')" width="150" />
          <el-table-column prop="user" :label="$t('orders.detail.audit.user')" width="120" />
          <el-table-column prop="timestamp" :label="$t('orders.detail.audit.timestamp')" width="180" />
          <el-table-column prop="details" :label="$t('orders.detail.audit.details')" />
        </x-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import XTable from '@/components/shared/XTable.vue';

const route = useRoute();

// State
const activeTab = ref('timeline');
const order = ref({
  id: 'ORDER001',
  status: 'paid',
  amount: 299,
  tenant: 'wemaster',
  user: '张三',
  createdAt: '2023-01-01 12:00:00',
  paymentStatus: 'completed',
  paymentMethod: 'Stripe',
  transactionId: 'TXN001',
  chargeId: 'CHG001'
});
const orderItems = ref([]);
const refunds = ref([]);
const auditLogs = ref([]);
const loading = ref(false);

// Computed
const getActiveStep = computed(() => {
  const steps = ['draft', 'pending', 'paid', 'fulfilled'];
  return steps.indexOf(order.value.status) + 1;
});

// Methods
const getStatusType = (status) => {
  const statusMap = {
    draft: '',
    pending: 'warning',
    paid: 'success',
    fulfilled: 'success',
    refunded: 'info',
    failed: 'danger'
  };
  return statusMap[status] || '';
};

const getPaymentStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger'
  };
  return statusMap[status] || '';
};

const getRefundStatusType = (status) => {
  const statusMap = {
    requested: 'warning',
    approved: 'success',
    completed: 'success',
    rejected: 'danger'
  };
  return statusMap[status] || '';
};

const handleRetryPayment = () => {
  console.log('Retry payment for order:', order.value.id);
};

const handleCreateRefund = () => {
  console.log('Create refund for order:', order.value.id);
};

const handleIssueInvoice = () => {
  console.log('Issue invoice for order:', order.value.id);
};

const fetchOrderItems = async () => {
  // Mock data
  orderItems.value = [
    {
      id: 'ITEM001',
      name: '数学基础课程',
      quantity: 1,
      unitPrice: 299,
      totalPrice: 299
    }
  ];
};

const fetchRefunds = async () => {
  // Mock data
  refunds.value = [
    {
      id: 'REFUND001',
      amount: 299,
      reason: '课程质量问题',
      status: 'completed',
      createdAt: '2023-01-02 12:00:00'
    }
  ];
};

const fetchAuditLogs = async () => {
  // Mock data
  auditLogs.value = [
    {
      id: 'AUDIT001',
      action: '创建订单',
      user: '张三',
      timestamp: '2023-01-01 12:00:00',
      details: '创建订单，金额299元'
    }
  ];
};

// Lifecycle
onMounted(() => {
  fetchOrderItems();
  fetchRefunds();
  fetchAuditLogs();
});
</script>

<style scoped>
.order-detail-view {
  padding: 20px;
}

.order-summary-card, .payment-status-card {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
}

.order-summary-card h3, .payment-status-card h3 {
  margin-top: 0;
}
</style>