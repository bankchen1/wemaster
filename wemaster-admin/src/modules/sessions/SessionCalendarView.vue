<template>
  <div class="session-calendar-view">
    <h2>{{ $t('sessions.calendar.title') }}</h2>
    <div class="calendar-header">
      <el-date-picker
        v-model="currentDate"
        type="month"
        :placeholder="$t('sessions.calendar.selectMonth')"
        @change="handleMonthChange"
      />
      <el-select
        v-model="selectedTutor"
        :placeholder="$t('sessions.calendar.selectTutor')"
        @change="handleTutorChange"
      >
        <el-option
          v-for="tutor in tutors"
          :key="tutor.id"
          :label="tutor.name"
          :value="tutor.id"
        />
      </el-select>
      <el-select
        v-model="selectedStudent"
        :placeholder="$t('sessions.calendar.selectStudent')"
        @change="handleStudentChange"
      >
        <el-option
          v-for="student in students"
          :key="student.id"
          :label="student.name"
          :value="student.id"
        />
      </el-select>
    </div>
    <el-calendar v-model="currentDate">
      <template #date-cell="{ data }">
        <div class="calendar-cell">
          <div class="calendar-day">{{ data.day.split('-')[2] }}</div>
          <div class="calendar-sessions">
            <div
              v-for="session in getSessionsForDate(data.day)"
              :key="session.id"
              class="session-item"
              :class="session.status"
              @click="handleViewSession(session)"
            >
              {{ session.time }} {{ session.title }}
            </div>
          </div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// State
const currentDate = ref(new Date());
const selectedTutor = ref('');
const selectedStudent = ref('');
const tutors = ref([]);
const students = ref([]);
const sessions = ref([]);

// Methods
const handleMonthChange = (date) => {
  console.log('Month changed:', date);
};

const handleTutorChange = (tutorId) => {
  console.log('Tutor changed:', tutorId);
};

const handleStudentChange = (studentId) => {
  console.log('Student changed:', studentId);
};

const getSessionsForDate = (date) => {
  // Mock data
  return sessions.value.filter(session => session.date === date);
};

const handleViewSession = (session) => {
  console.log('View session:', session);
};

const fetchTutors = async () => {
  // Mock data
  tutors.value = [
    { id: 'TUTOR001', name: '李老师' },
    { id: 'TUTOR002', name: '王老师' }
  ];
};

const fetchStudents = async () => {
  // Mock data
  students.value = [
    { id: 'STUDENT001', name: '张三' },
    { id: 'STUDENT002', name: '李四' }
  ];
};

const fetchSessions = async () => {
  // Mock data
  sessions.value = [
    {
      id: 'SESSION001',
      title: '数学课',
      date: '2023-01-15',
      time: '10:00',
      status: 'scheduled'
    }
  ];
};

// Lifecycle
onMounted(() => {
  fetchTutors();
  fetchStudents();
  fetchSessions();
});
</script>

<style scoped>
.session-calendar-view {
  padding: 20px;
}

.calendar-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-day {
  font-weight: bold;
  margin-bottom: 5px;
}

.calendar-sessions {
  flex: 1;
  overflow: hidden;
}

.session-item {
  font-size: 12px;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-item.scheduled {
  background-color: #409eff;
  color: white;
}

.session-item.completed {
  background-color: #67c23a;
  color: white;
}

.session-item.cancelled {
  background-color: #f56c6c;
  color: white;
}
</style>