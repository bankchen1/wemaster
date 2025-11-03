<template>
  <div class="tutor-detail-view">
    <h2>{{ $t('tutors.detail.title') }}</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('tutors.detail.tabs.profile')" name="profile">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('tutors.detail.fields.id')">
            {{ tutor.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tutors.detail.fields.name')">
            {{ tutor.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tutors.detail.fields.email')">
            {{ tutor.email }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tutors.detail.fields.status')">
            <el-tag :type="tutor.status === 'active' ? 'success' : 'danger'">
              {{ tutor.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tutors.detail.fields.rating')">
            {{ tutor.rating }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('tutors.detail.fields.monthlyEarnings')">
            ¥{{ tutor.monthlyEarnings }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('tutors.detail.tabs.schedule')" name="schedule">
        <div class="schedule-section">
          <div class="schedule-header">
            <el-button type="primary" @click="handleEditSchedule">
              {{ $t('tutors.detail.actions.editSchedule') }}
            </el-button>
            <el-button @click="handleBatchEdit">
              {{ $t('tutors.detail.actions.batchEdit') }}
            </el-button>
          </div>
          <x-table
            :data="schedule"
            :loading="loading"
          >
            <el-table-column prop="date" :label="$t('tutors.detail.schedule.date')" width="120" />
            <el-table-column prop="time" :label="$t('tutors.detail.schedule.time')" width="150" />
            <el-table-column prop="status" :label="$t('tutors.detail.schedule.status')" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'available' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.actions')" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEditSlot(row)">
                  {{ $t('common.edit') }}
                </el-button>
              </template>
            </el-table-column>
          </x-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('tutors.detail.tabs.courses')" name="courses">
        <div class="courses-section">
          <div class="courses-header">
            <el-button type="primary" @click="handleAddCourse">
              {{ $t('tutors.detail.actions.addCourse') }}
            </el-button>
            <el-button @click="handleBatchPublish">
              {{ $t('tutors.detail.actions.batchPublish') }}
            </el-button>
          </div>
          <x-table
            :data="courses"
            :loading="loading"
          >
            <el-table-column prop="id" :label="$t('tutors.detail.courses.id')" width="180" />
            <el-table-column prop="name" :label="$t('tutors.detail.courses.name')" />
            <el-table-column prop="status" :label="$t('tutors.detail.courses.status')" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'published' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sales" :label="$t('tutors.detail.courses.sales')" width="120" />
            <el-table-column prop="conversionRate" :label="$t('tutors.detail.courses.conversionRate')" width="120" />
            <el-table-column :label="$t('common.actions')" width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEditCourse(row)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-button type="success" size="small" @click="handleTogglePublish(row)" v-if="row.status === 'draft'">
                  {{ $t('tutors.detail.actions.publish') }}
                </el-button>
                <el-button type="warning" size="small" @click="handleTogglePublish(row)" v-else>
                  {{ $t('tutors.detail.actions.unpublish') }}
                </el-button>
              </template>
            </el-table-column>
          </x-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('tutors.detail.tabs.earnings')" name="earnings">
        <div class="earnings-section">
          <el-descriptions :column="2" border class="earnings-summary">
            <el-descriptions-item :label="$t('tutors.detail.earnings.total')">
              ¥{{ earnings.total }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('tutors.detail.earnings.pending')">
              ¥{{ earnings.pending }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('tutors.detail.earnings.withdrawable')">
              ¥{{ earnings.withdrawable }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('tutors.detail.earnings.settled')">
              ¥{{ earnings.settled }}
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="earnings-actions">
            <el-button type="primary" @click="handleGenerateSettlement">
              {{ $t('tutors.detail.actions.generateSettlement') }}
            </el-button>
            <el-button type="success" @click="handleInitiatePayout">
              {{ $t('tutors.detail.actions.initiatePayout') }}
            </el-button>
          </div>
          
          <x-table
            :data="settlements"
            :loading="loading"
            class="settlements-table"
          >
            <el-table-column prop="id" :label="$t('tutors.detail.settlements.id')" width="180" />
            <el-table-column prop="period" :label="$t('tutors.detail.settlements.period')" width="150" />
            <el-table-column prop="amount" :label="$t('tutors.detail.settlements.amount')" width="120" />
            <el-table-column prop="tax" :label="$t('tutors.detail.settlements.tax')" width="120" />
            <el-table-column prop="netAmount" :label="$t('tutors.detail.settlements.netAmount')" width="120" />
            <el-table-column prop="status" :label="$t('tutors.detail.settlements.status')" width="120">
              <template #default="{ row }">
                <el-tag :type="getSettlementStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.actions')" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleViewSettlement(row)">
                  {{ $t('common.view') }}
                </el-button>
              </template>
            </el-table-column>
          </x-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('tutors.detail.tabs.messages')" name="messages">
        <div class="messages-section">
          <div class="messages-header">
            <el-button type="primary" @click="handleSendMessage">
              {{ $t('tutors.detail.actions.sendMessage') }}
            </el-button>
          </div>
          <x-table
            :data="messages"
            :loading="loading"
          >
            <el-table-column prop="id" :label="$t('tutors.detail.messages.id')" width="180" />
            <el-table-column prop="student" :label="$t('tutors.detail.messages.student')" />
            <el-table-column prop="content" :label="$t('tutors.detail.messages.content')" />
            <el-table-column prop="timestamp" :label="$t('tutors.detail.messages.timestamp')" width="180" />
            <el-table-column :label="$t('common.actions')" width="150">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleReplyMessage(row)">
                  {{ $t('tutors.detail.actions.reply') }}
                </el-button>
              </template>
            </el-table-column>
          </x-table>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('tutors.detail.tabs.ratings')" name="ratings">
        <x-table
          :data="ratings"
          :loading="loading"
        >
          <el-table-column prop="id" :label="$t('tutors.detail.ratings.id')" width="180" />
          <el-table-column prop="student" :label="$t('tutors.detail.ratings.student')" />
          <el-table-column prop="rating" :label="$t('tutors.detail.ratings.rating')" width="120" />
          <el-table-column prop="comment" :label="$t('tutors.detail.ratings.comment')" />
          <el-table-column prop="timestamp" :label="$t('tutors.detail.ratings.timestamp')" width="180" />
        </x-table>
      </el-tab-pane>
    </el-tabs>
    
    <!-- Schedule Edit Dialog -->
    <el-dialog
      v-model="scheduleDialogVisible"
      :title="$t('tutors.detail.schedule.editTitle')"
      width="500px"
    >
      <el-form
        ref="scheduleFormRef"
        :model="scheduleForm"
        label-width="100px"
      >
        <el-form-item :label="$t('tutors.detail.schedule.date')">
          <el-date-picker
            v-model="scheduleForm.date"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item :label="$t('tutors.detail.schedule.time')">
          <el-time-picker
            v-model="scheduleForm.time"
            is-range
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item :label="$t('tutors.detail.schedule.status')">
          <el-select v-model="scheduleForm.status">
            <el-option
              v-for="status in scheduleStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="scheduleDialogVisible = false">
            {{ $t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="handleSaveSchedule">
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
const scheduleFormRef = ref(null);

// State
const activeTab = ref('profile');
const scheduleDialogVisible = ref(false);

const tutor = ref({
  id: 'TUTOR001',
  name: '李老师',
  email: 'lilaoshi@example.com',
  status: 'active',
  rating: 4.8,
  monthlyEarnings: 12000
});

const courses = ref([]);
const schedule = ref([]);
const earnings = ref({
  total: 50000,
  pending: 2000,
  withdrawable: 48000,
  settled: 45000
});
const settlements = ref([]);
const messages = ref([]);
const ratings = ref([]);

const loading = ref(false);

const scheduleForm = ref({
  date: '',
  time: [],
  status: 'available'
});

const scheduleStatusOptions = [
  { label: $t('tutors.detail.schedule.status.available'), value: 'available' },
  { label: $t('tutors.detail.schedule.status.unavailable'), value: 'unavailable' }
];

// Methods
const handleEditSchedule = () => {
  console.log('Edit schedule for tutor:', tutor.value.id);
};

const handleBatchEdit = () => {
  console.log('Batch edit schedule for tutor:', tutor.value.id);
};

const handleEditSlot = (slot) => {
  scheduleForm.value = { ...slot };
  scheduleDialogVisible.value = true;
};

const handleSaveSchedule = async () => {
  if (!scheduleFormRef.value) return;
  
  try {
    // In a real implementation, call API to save schedule
    console.log('Save schedule:', scheduleForm.value);
    ElMessage.success($t('tutors.detail.schedule.saveSuccess'));
    scheduleDialogVisible.value = false;
  } catch (error) {
    console.error('Failed to save schedule:', error);
    ElMessage.error($t('tutors.detail.schedule.saveFailed'));
  }
};

const handleAddCourse = () => {
  console.log('Add course for tutor:', tutor.value.id);
};

const handleBatchPublish = () => {
  console.log('Batch publish courses for tutor:', tutor.value.id);
};

const handleEditCourse = (course) => {
  console.log('Edit course:', course);
};

const handleTogglePublish = (course) => {
  console.log('Toggle publish status for course:', course);
};

const handleGenerateSettlement = () => {
  console.log('Generate settlement for tutor:', tutor.value.id);
};

const handleInitiatePayout = () => {
  console.log('Initiate payout for tutor:', tutor.value.id);
};

const handleViewSettlement = (settlement) => {
  console.log('View settlement:', settlement);
};

const handleSendMessage = () => {
  console.log('Send message to tutor:', tutor.value.id);
};

const handleReplyMessage = (message) => {
  console.log('Reply to message:', message);
};

const getSettlementStatusType = (status) => {
  const types = {
    pending: 'warning',
    settled: 'success',
    failed: 'danger'
  };
  return types[status] || 'info';
};

const fetchCourses = async () => {
  // Mock data
  courses.value = [
    {
      id: 'COURSE001',
      name: '数学基础课程',
      status: 'published',
      sales: 120,
      conversionRate: '25%'
    },
    {
      id: 'COURSE002',
      name: '英语进阶课程',
      status: 'draft',
      sales: 0,
      conversionRate: '0%'
    }
  ];
};

const fetchSchedule = async () => {
  // Mock data
  schedule.value = [
    {
      id: 'SLOT001',
      date: '2023-06-01',
      time: ['09:00', '12:00'],
      status: 'available'
    },
    {
      id: 'SLOT002',
      date: '2023-06-02',
      time: ['14:00', '18:00'],
      status: 'unavailable'
    }
  ];
};

const fetchSettlements = async () => {
  // Mock data
  settlements.value = [
    {
      id: 'SETTLE001',
      period: '2023-05',
      amount: 12000,
      tax: 1200,
      netAmount: 10800,
      status: 'settled'
    },
    {
      id: 'SETTLE002',
      period: '2023-04',
      amount: 10000,
      tax: 1000,
      netAmount: 9000,
      status: 'pending'
    }
  ];
};

const fetchMessages = async () => {
  // Mock data
  messages.value = [
    {
      id: 'MSG001',
      student: '学生A',
      content: '老师，请问明天的课程还能调整时间吗？',
      timestamp: '2023-05-30 10:30:00'
    },
    {
      id: 'MSG002',
      student: '学生B',
      content: '感谢老师的精彩讲解！',
      timestamp: '2023-05-29 15:45:00'
    }
  ];
};

const fetchRatings = async () => {
  // Mock data
  ratings.value = [
    {
      id: 'RATING001',
      student: '学生A',
      rating: 5,
      comment: '老师讲解清晰，很有帮助',
      timestamp: '2023-05-30 14:20:00'
    },
    {
      id: 'RATING002',
      student: '学生B',
      rating: 4,
      comment: '课程内容丰富，但节奏稍快',
      timestamp: '2023-05-28 11:15:00'
    }
  ];
};

// Lifecycle
onMounted(() => {
  fetchCourses();
  fetchSchedule();
  fetchSettlements();
  fetchMessages();
  fetchRatings();
});
</script>

<style scoped>
.tutor-detail-view {
  padding: 20px;
}

.schedule-section,
.courses-section,
.earnings-section,
.messages-section {
  padding: 20px 0;
}

.schedule-header,
.courses-header,
.earnings-actions,
.messages-header {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.earnings-summary {
  margin-bottom: 20px;
}

.earnings-actions {
  margin-bottom: 20px;
}

.settlements-table {
  margin-top: 20px;
}
</style>