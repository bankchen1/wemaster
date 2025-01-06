<template>
  <div class="schedule-view">
    <ScheduleStats :schedules="store.schedules" />
    <ScheduleFilter
      :schedules="store.schedules"
      @filter="handleFilteredSchedules"
    />
    <div class="calendar-header">
      <el-button @click="setToday">今天</el-button>
      <div class="month-navigation">
        <el-button @click="changeMonth(-1)">&lt;</el-button>
        <span>{{ currentDate.getFullYear() }}年{{ currentDate.getMonth() + 1 }}月</span>
        <el-button @click="changeMonth(1)">&gt;</el-button>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="weekday-header" v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">
        {{ day }}
      </div>

      <div
        v-for="day in calendarDays"
        :key="day"
        :class="[
          'calendar-day',
          { 'is-today': isToday(day) },
          { 'is-empty': !day }
        ]"
        @click="day && showCreateDialog(day)"
      >
        <span v-if="day" class="day-number">{{ day }}</span>
        <div v-if="day" class="schedule-list">
          <el-tag
            v-for="schedule in getSchedulesForDate(day)"
            :key="schedule.id"
            :type="getScheduleTagType(schedule)"
            class="schedule-item"
            @click.stop="showScheduleDetails(schedule)"
          >
            {{ schedule.title }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 创建课程对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建课程"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-form :model="scheduleForm" :rules="scheduleRules" label-width="100px">
        <el-form-item label="课程标题" prop="title">
          <el-input v-model="scheduleForm.title" />
        </el-form-item>

        <el-form-item label="课程描述">
          <el-input v-model="scheduleForm.description" type="textarea" />
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="scheduleForm.startTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="scheduleForm.endTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="最大学生数" prop="maxStudents">
          <el-input-number v-model="scheduleForm.maxStudents" :min="1" />
        </el-form-item>

        <el-form-item label="课程价格" prop="price">
          <el-input-number v-model="scheduleForm.price" :min="0" :precision="2" />
          <el-select v-model="scheduleForm.currency" class="ml-2">
            <el-option label="USD" value="USD" />
            <el-option label="CNY" value="CNY" />
          </el-select>
        </el-form-item>

        <el-form-item label="课程标签">
          <el-select v-model="scheduleForm.tags" multiple>
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="周期性课程">
          <el-switch v-model="scheduleForm.isRecurring" />
        </el-form-item>

        <template v-if="scheduleForm.isRecurring">
          <el-form-item label="重复类型">
            <el-select v-model="scheduleForm.recurringType">
              <el-option label="每天" value="daily" />
              <el-option label="每周" value="weekly" />
              <el-option label="每月" value="monthly" />
            </el-select>
          </el-form-item>

          <el-form-item label="结束日期">
            <el-date-picker
              v-model="scheduleForm.recurringEndDate"
              type="date"
              format="YYYY-MM-DD"
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createSchedule">创建</el-button>
      </template>
    </el-dialog>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="课程详情"
      width="50%"
    >
      <template v-if="selectedSchedule">
        <div class="schedule-details">
          <h3>{{ selectedSchedule.title }}</h3>
          <p>{{ selectedSchedule.description }}</p>
          <p>时间：{{ formatDateTime(selectedSchedule.startTime) }} - {{ formatDateTime(selectedSchedule.endTime) }}</p>
          <p>价格：{{ selectedSchedule.price }} {{ selectedSchedule.currency }}</p>
          <p>已报名：{{ selectedSchedule.enrolledStudents.length }}/{{ selectedSchedule.maxStudents }}</p>
          <p>状态：{{ selectedSchedule.status }}</p>
          <div class="schedule-tags">
            <el-tag
              v-for="tag in selectedSchedule.tags"
              :key="tag"
              class="ml-2"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="detailsDialogVisible = false">关闭</el-button>
        <el-button
          v-if="canEnroll"
          type="primary"
          @click="enrollCourse"
        >
          报名
        </el-button>
        <el-button
          v-if="canUnenroll"
          type="danger"
          @click="unenrollCourse"
        >
          取消报名
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import { ElMessage } from 'element-plus'
import type { ClassSchedule } from '@/types/classroom'
import { v4 as uuidv4 } from 'uuid'
import { formatDateTime } from '@/utils/time'
import ScheduleFilter from '@/components/ScheduleFilter.vue'
import ScheduleStats from '@/components/ScheduleStats.vue'

const store = useScheduleStore()
const currentDate = ref(new Date())
const filteredSchedules = ref<ClassSchedule[]>([])

const createDialogVisible = ref(false)
const detailsDialogVisible = ref(false)
const selectedSchedule = ref<ClassSchedule | null>(null)

const scheduleForm = ref({
  id: '',
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  maxStudents: 1,
  price: 0,
  currency: 'USD',
  tags: [],
  isRecurring: false,
  recurringType: 'weekly',
  recurringEndDate: ''
})

const scheduleRules = {
  title: [{ required: true, message: '请输入课程标题', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  maxStudents: [{ required: true, message: '请输入最大学生数', trigger: 'blur' }],
  price: [{ required: true, message: '请输入课程价格', trigger: 'blur' }]
}

const availableTags = [
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '历史',
  '地理',
  '政治',
  '语文'
]

const changeMonth = (offset: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + offset)
  currentDate.value = newDate
}

const setToday = () => {
  currentDate.value = new Date()
}

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month, 1).getDay()
})

const calendarDays = computed(() => {
  const days = []
  const totalDays = daysInMonth.value
  const firstDay = firstDayOfMonth.value

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }

  return days
})

const isToday = (day: number | null) => {
  if (!day) return false
  const today = new Date()
  return (
    today.getDate() === day &&
    today.getMonth() === currentDate.value.getMonth() &&
    today.getFullYear() === currentDate.value.getFullYear()
  )
}

const handleFilteredSchedules = (schedules: ClassSchedule[]) => {
  filteredSchedules.value = schedules
}

const getSchedulesForDate = (day: number | null) => {
  if (!day) return []
  const date = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    day
  )
  return filteredSchedules.value.filter((schedule: ClassSchedule) => {
    const scheduleDate = new Date(schedule.startTime)
    return (
      scheduleDate.getDate() === date.getDate() &&
      scheduleDate.getMonth() === date.getMonth() &&
      scheduleDate.getFullYear() === date.getFullYear()
    )
  })
}

const getScheduleTagType = (schedule: ClassSchedule) => {
  if (schedule.status === 'cancelled') return 'danger'
  if (schedule.enrolledStudents.length >= schedule.maxStudents) return 'warning'
  return 'success'
}

const showScheduleDetails = (schedule: ClassSchedule) => {
  selectedSchedule.value = schedule
  detailsDialogVisible.value = true
}

const showCreateDialog = (day: number) => {
  const startTime = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    day,
    9,
    0
  )
  const endTime = new Date(startTime)
  endTime.setHours(startTime.getHours() + 1)

  scheduleForm.value = {
    id: uuidv4(),
    title: '',
    description: '',
    startTime: startTime.toISOString().slice(0, 16),
    endTime: endTime.toISOString().slice(0, 16),
    maxStudents: 1,
    price: 0,
    currency: 'USD',
    tags: [],
    isRecurring: false,
    recurringType: 'weekly',
    recurringEndDate: ''
  }

  createDialogVisible.value = true
}

const createSchedule = async () => {
  try {
    await store.createSchedule({
      ...scheduleForm.value,
      enrolledStudents: [],
      waitlist: [],
      teacher: store.currentUser,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    createDialogVisible.value = false
    ElMessage.success('课程创建成功')
  } catch (error) {
    ElMessage.error('创建课程失败')
  }
}

const canEnroll = computed(() => {
  if (!selectedSchedule.value) return false
  return (
    selectedSchedule.value.status === 'scheduled' &&
    !selectedSchedule.value.enrolledStudents.includes(store.currentUser.id) &&
    selectedSchedule.value.enrolledStudents.length < selectedSchedule.value.maxStudents
  )
})

const enrollCourse = async () => {
  if (!selectedSchedule.value) return
  try {
    await store.enrollCourse(selectedSchedule.value.id)
    ElMessage.success('报名成功')
    detailsDialogVisible.value = false
  } catch (error) {
    ElMessage.error('报名失败')
  }
}

const canUnenroll = computed(() => {
  if (!selectedSchedule.value) return false
  return (
    selectedSchedule.value.status === 'scheduled' &&
    selectedSchedule.value.enrolledStudents.includes(store.currentUser.id)
  )
})

const unenrollCourse = async () => {
  if (!selectedSchedule.value) return
  try {
    await store.unenrollCourse(selectedSchedule.value.id)
    ElMessage.success('取消报名成功')
    detailsDialogVisible.value = false
  } catch (error) {
    ElMessage.error('取消报名失败')
  }
}

// 在组件挂载时获取课程数据
onMounted(async () => {
  try {
    await store.fetchSchedules()
    filteredSchedules.value = store.schedules
  } catch (error) {
    ElMessage.error('获取课程数据失败')
  }
})
</script>

<style lang="scss" scoped>
.schedule-view {
  padding: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .month-navigation {
    display: flex;
    align-items: center;
    gap: 10px;

    span {
      font-size: 1.2em;
      font-weight: bold;
    }
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #eee;
  border: 1px solid #eee;

  .weekday-header {
    background-color: #f5f7fa;
    padding: 10px;
    text-align: center;
    font-weight: bold;
  }

  .calendar-day {
    background-color: white;
    min-height: 100px;
    padding: 10px;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }

    &.is-today {
      background-color: #e6f7ff;
    }

    &.is-empty {
      cursor: default;
      &:hover {
        background-color: white;
      }
    }
  }
}

.day-number {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.schedule-item {
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-details {
  h3 {
    margin-top: 0;
  }

  .schedule-tags {
    margin-top: 10px;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }
}

.ml-2 {
  margin-left: 8px;
}
</style>
