<template>
  <div class="student-detail-view">
    <h2>{{ $t('students.detail.title') }}</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('students.detail.tabs.profile')" name="profile">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('students.detail.fields.id')">
            {{ student.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('students.detail.fields.name')">
            {{ student.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('students.detail.fields.email')">
            {{ student.email }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('students.detail.fields.vipLevel')">
            <el-tag type="success">
              {{ student.vipLevel }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('students.detail.fields.walletBalance')">
            ¥{{ student.walletBalance }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('students.detail.fields.coursesEnrolled')">
            {{ student.coursesEnrolled }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('students.detail.tabs.purchases')" name="purchases">
        <div class="purchases-section">
          <div class="purchases-header">
            <el-button type="primary" @click="handleExportPurchases">
              {{ $t('students.detail.actions.exportPurchases') }}
            </el-button>
          </div>
          <x-table
            :data="purchases"
            :loading="loading"
          >
            <el-table-column prop="id" :label="$t('students.detail.purchases.id')" width="180" />
            <el-table-column prop="course" :label="$t('students.detail.purchases.course')" />
            <el-table-column prop="amount" :label="$t('students.detail.purchases.amount')" width="120" />
            <el-table-column prop="date" :label="$t('students.detail.purchases.date')" width="180" />
            <el-table-column prop="status" :label="$t('students.detail.purchases.status')" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.actions')" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleViewOrder(row)">
                  {{ $t('common.view') }}
                </el-button>
              </template>
            </el-table-column>
          </x-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('students.detail.tabs.progress')" name="progress">
        <div class="progress-section">
          <x-table
            :data="progress"
            :loading="loading"
          >
            <el-table-column prop="course" :label="$t('students.detail.progress.course')" />
            <el-table-column prop="completedLessons" :label="$t('students.detail.progress.completed')" width="150" />
            <el-table-column prop="totalLessons" :label="$t('students.detail.progress.total')" width="120" />
            <el-table-column prop="completionRate" :label="$t('students.detail.progress.rate')" width="120" />
            <el-table-column prop="lastAccessed" :label="$t('students.detail.progress.lastAccessed')" width="180" />
            <el-table-column :label="$t('common.actions')" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleViewProgress(row)">
                  {{ $t('common.view') }}
                </el-button>
              </template>
            </el-table-column>
          </x-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('students.detail.tabs.wallet')" name="wallet">
        <div class="wallet-section">
          <el-descriptions :column="2" border class="wallet-summary">
            <el-descriptions-item :label="$t('students.detail.wallet.balance')">
              ¥{{ wallet.balance }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('students.detail.wallet.frozen')">
              ¥{{ wallet.frozen }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('students.detail.wallet.total')">
              ¥{{ wallet.total }}
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="wallet-actions">
            <el-button type="primary" @click="handleRecharge">
              {{ $t('students.detail.actions.recharge') }}
            </el-button>
            <el-button type="warning" @click="handleFreezeWallet">
              {{ $t('students.detail.actions.freezeWallet') }}
            </el-button>
            <el-button @click="handleAdjustBalance">
              {{ $t('students.detail.actions.adjustBalance') }}
            </el-button>
          </div>
          
          <x-table
            :data="walletTransactions"
            :loading="loading"
            class="wallet-transactions"
          >
            <el-table-column prop="id" :label="$t('students.detail.wallet.transactions.id')" width="180" />
            <el-table-column prop="type" :label="$t('students.detail.wallet.transactions.type')" width="120" />
            <el-table-column prop="amount" :label="$t('students.detail.wallet.transactions.amount')" width="120" />
            <el-table-column prop="balanceAfter" :label="$t('students.detail.wallet.transactions.balance')" width="120" />
            <el-table-column prop="date" :label="$t('students.detail.wallet.transactions.date')" width="180" />
            <el-table-column prop="relatedOrder" :label="$t('students.detail.wallet.transactions.order')" width="180" />
          </x-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('students.detail.tabs.vip')" name="vip">
        <div class="vip-section">
          <el-descriptions :column="2" border class="vip-summary">
            <el-descriptions-item :label="$t('students.detail.vip.level')">
              <el-tag type="success">
                {{ vip.level }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('students.detail.vip.expiry')">
              {{ vip.expiry }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('students.detail.vip.renewalDate')">
              {{ vip.renewalDate }}
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="vip-actions">
            <el-button type="primary" @click="handleExtendVip">
              {{ $t('students.detail.actions.extendVip') }}
            </el-button>
            <el-button type="warning" @click="handleCancelVip">
              {{ $t('students.detail.actions.cancelVip') }}
            </el-button>
            <el-button @click="handleChangeVipLevel">
              {{ $t('students.detail.actions.changeVipLevel') }}
            </el-button>
          </div>
          
          <x-table
            :data="vipInvoices"
            :loading="loading"
            class="vip-invoices"
          >
            <el-table-column prop="id" :label="$t('students.detail.vip.invoices.id')" width="180" />
            <el-table-column prop="amount" :label="$t('students.detail.vip.invoices.amount')" width="120" />
            <el-table-column prop="date" :label="$t('students.detail.vip.invoices.date')" width="180" />
            <el-table-column prop="status" :label="$t('students.detail.vip.invoices.status')" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'paid' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.actions')" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleViewInvoice(row)">
                  {{ $t('common.view') }}
                </el-button>
              </template>
            </el-table-column>
          </x-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('students.detail.tabs.support')" name="support">
        <div class="support-section">
          <el-button type="primary" @click="handleAdjustPrivileges">
            {{ $t('students.detail.actions.adjustPrivileges') }}
          </el-button>
          <el-button type="warning" @click="handleIssueRefund">
            {{ $t('students.detail.actions.issueRefund') }}
          </el-button>
          <el-button @click="handleSendNotification">
            {{ $t('students.detail.actions.sendNotification') }}
          </el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- Recharge Dialog -->
    <el-dialog
      v-model="rechargeDialogVisible"
      :title="$t('students.detail.wallet.rechargeTitle')"
      width="500px"
    >
      <el-form
        ref="rechargeFormRef"
        :model="rechargeForm"
        :rules="rechargeFormRules"
        label-width="100px"
      >
        <el-form-item :label="$t('students.detail.wallet.amount')" prop="amount">
          <el-input v-model="rechargeForm.amount" type="number">
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('students.detail.wallet.reason')" prop="reason">
          <el-input v-model="rechargeForm.reason" type="textarea" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rechargeDialogVisible = false">
            {{ $t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="handleSaveRecharge">
            {{ $t('common.save') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import XTable from '@/components/shared/XTable.vue';

const route = useRoute();

// Refs
const rechargeFormRef = ref(null);

// State
const activeTab = ref('profile');
const rechargeDialogVisible = ref(false);

const student = ref({
  id: 'STUDENT001',
  name: '王小明',
  email: 'wangxiaoming@example.com',
  vipLevel: 'VIP3',
  walletBalance: 1200,
  coursesEnrolled: 5
});

const purchases = ref([]);
const progress = ref([]);
const wallet = ref({
  balance: 1200,
  frozen: 0,
  total: 1200
});
const walletTransactions = ref([]);
const vip = ref({
  level: 'VIP3',
  expiry: '2024-12-31',
  renewalDate: '2024-12-01'
});
const vipInvoices = ref([]);

const loading = ref(false);

const rechargeForm = ref({
  amount: 0,
  reason: ''
});

const rechargeFormRules = {
  amount: [
    { required: true, message: $t('students.detail.wallet.validation.amountRequired'), trigger: 'blur' },
    { type: 'number', min: 0.01, message: $t('students.detail.wallet.validation.amountMin'), trigger: 'blur' }
  ],
  reason: [
    { required: true, message: $t('students.detail.wallet.validation.reasonRequired'), trigger: 'blur' }
  ]
};

// Methods
const handleExportPurchases = () => {
  console.log('Export purchases for student:', student.value.id);
};

const handleViewOrder = (order) => {
  console.log('View order:', order);
};

const handleViewProgress = (progress) => {
  console.log('View progress:', progress);
};

const handleRecharge = () => {
  rechargeForm.value = {
    amount: 0,
    reason: ''
  };
  rechargeDialogVisible.value = true;
};

const handleFreezeWallet = () => {
  console.log('Freeze wallet for student:', student.value.id);
};

const handleAdjustBalance = () => {
  console.log('Adjust balance for student:', student.value.id);
};

const handleExtendVip = () => {
  console.log('Extend VIP for student:', student.value.id);
};

const handleCancelVip = () => {
  console.log('Cancel VIP for student:', student.value.id);
};

const handleChangeVipLevel = () => {
  console.log('Change VIP level for student:', student.value.id);
};

const handleViewInvoice = (invoice) => {
  console.log('View invoice:', invoice);
};

const handleAdjustPrivileges = () => {
  console.log('Adjust privileges for student:', student.value.id);
};

const handleIssueRefund = () => {
  console.log('Issue refund for student:', student.value.id);
};

const handleSendNotification = () => {
  console.log('Send notification to student:', student.value.id);
};

const handleSaveRecharge = async () => {
  if (!rechargeFormRef.value) return;
  
  await rechargeFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    try {
      // In a real implementation, call API to recharge wallet
      console.log('Recharge wallet:', rechargeForm.value);
      ElMessage.success($t('students.detail.wallet.rechargeSuccess'));
      rechargeDialogVisible.value = false;
      fetchWalletTransactions();
    } catch (error) {
      console.error('Failed to recharge wallet:', error);
      ElMessage.error($t('students.detail.wallet.rechargeFailed'));
    }
  });
};

const fetchPurchases = async () => {
  // Mock data
  purchases.value = [
    {
      id: 'ORDER001',
      course: '数学基础课程',
      amount: 299,
      date: '2023-01-01 12:00:00',
      status: 'completed'
    },
    {
      id: 'ORDER002',
      course: '英语进阶课程',
      amount: 399,
      date: '2023-02-01 12:00:00',
      status: 'completed'
    }
  ];
};

const fetchProgress = async () => {
  // Mock data
  progress.value = [
    {
      course: '数学基础课程',
      completedLessons: 8,
      totalLessons: 12,
      completionRate: '66.7%',
      lastAccessed: '2023-05-30 14:30:00'
    },
    {
      course: '英语进阶课程',
      completedLessons: 5,
      totalLessons: 15,
      completionRate: '33.3%',
      lastAccessed: '2023-05-28 10:15:00'
    }
  ];
};

const fetchWalletTransactions = async () => {
  // Mock data
  walletTransactions.value = [
    {
      id: 'TXN001',
      type: '充值',
      amount: '+300',
      balanceAfter: 1200,
      date: '2023-01-01 12:00:00',
      relatedOrder: 'ORDER001'
    },
    {
      id: 'TXN002',
      type: '消费',
      amount: '-299',
      balanceAfter: 901,
      date: '2023-01-02 14:00:00',
      relatedOrder: 'ORDER002'
    }
  ];
};

const fetchVipInvoices = async () => {
  // Mock data
  vipInvoices.value = [
    {
      id: 'INV001',
      amount: 299,
      date: '2023-01-01 12:00:00',
      status: 'paid'
    },
    {
      id: 'INV002',
      amount: 299,
      date: '2023-02-01 12:00:00',
      status: 'paid'
    }
  ];
};

// Lifecycle
onMounted(() => {
  fetchPurchases();
  fetchProgress();
  fetchWalletTransactions();
  fetchVipInvoices();
});
</script>

<style scoped>
.student-detail-view {
  padding: 20px;
}

.purchases-section,
.progress-section,
.wallet-section,
.vip-section,
.support-section {
  padding: 20px 0;
}

.purchases-header,
.wallet-actions,
.vip-actions,
.support-section {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.wallet-summary,
.vip-summary {
  margin-bottom: 20px;
}

.wallet-transactions,
.vip-invoices {
  margin-top: 20px;
}
</style>