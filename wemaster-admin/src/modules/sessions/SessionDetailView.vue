<template>
  <div class="session-detail-view">
    <h2>{{ $t('sessions.detail.title') }}</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('sessions.detail.tabs.overview')" name="overview">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('sessions.detail.fields.id')">
            {{ session.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('sessions.detail.fields.course')">
            {{ session.course }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('sessions.detail.fields.tutor')">
            {{ session.tutor }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('sessions.detail.fields.student')">
            {{ session.student }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('sessions.detail.fields.scheduledTime')">
            {{ session.scheduledTime }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('sessions.detail.fields.actualTime')">
            {{ session.actualTime }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('sessions.detail.fields.status')">
            <el-tag :type="getStatusType(session.status)">
              {{ session.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('sessions.detail.tabs.reschedule')" name="reschedule">
        <el-button type="primary" @click="handleReschedule">
          {{ $t('sessions.detail.actions.reschedule') }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane :label="$t('sessions.detail.tabs.attendance')" name="attendance">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('sessions.detail.attendance.status')">
            <el-tag :type="session.attendanceStatus === 'attended' ? 'success' : 'warning'">
              {{ session.attendanceStatus }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('sessions.detail.attendance.checkInTime')">
            {{ session.checkInTime }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('sessions.detail.tabs.notes')" name="notes">
        <el-input
          v-model="session.notes"
          type="textarea"
          :rows="4"
          :placeholder="$t('sessions.detail.notes.placeholder')"
        />
        <el-button type="primary" @click="handleSaveNotes" style="margin-top: 10px;">
          {{ $t('sessions.detail.actions.saveNotes') }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane :label="$t('sessions.detail.tabs.audit')" name="audit">
        <x-table
          :data="auditLogs"
          :loading="loading"
        >
          <el-table-column prop="id" :label="$t('sessions.detail.audit.id')" width="180" />
          <el-table-column prop="action" :label="$t('sessions.detail.audit.action')" width="150" />
          <el-table-column prop="user" :label="$t('sessions.detail.audit.user')" width="120" />
          <el-table-column prop="timestamp" :label="$t('sessions.detail.audit.timestamp')" width="180" />
        </x-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import XTable from '@/components/shared/XTable.vue';

const route = useRoute();

// State
const activeTab = ref('overview');
const session = ref({
  id: 'SESSION001',
  course: '数学基础课程',
  tutor: '李老师',
  student: '张三',
  scheduledTime: '2023-01-15 10:00',
  actualTime: '2023-01-15 10:05',
  status: 'completed',
  attendanceStatus: 'attended',
  checkInTime: '2023-01-15 10:05',
  notes: '学生表现良好，积极参与互动'
});
const auditLogs = ref([]);
const loading = ref(false);

// Methods
const getStatusType = (status) => {
  const statusMap = {
    scheduled: '',
    completed: 'success',
    cancelled: 'danger',
    'no-show': 'warning'
  };
  return statusMap[status] || '';
};

const handleReschedule = () => {
  console.log('Reschedule session:', session.value.id);
};

const handleSaveNotes = () => {
  console.log('Save notes for session:', session.value.id);
};

const fetchAuditLogs = async () => {
  // Mock data
  auditLogs.value = [
    {
      id: 'AUDIT001',
      action: '创建预约',
      user: '张三',
      timestamp: '2023-01-10 12:00:00'
    }
  ];
};

// Lifecycle
onMounted(() => {
  fetchAuditLogs();
});
</script>

<style scoped>
.session-detail-view {
  padding: 20px;
}
</style>