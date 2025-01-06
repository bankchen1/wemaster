<template>
  <div class="schedule-stats">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总课程数</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="totalSchedules">
              <template #title>
                <div class="statistic-title">当前课程总数</div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月课程</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="monthlySchedules">
              <template #title>
                <div class="statistic-title">本月课程数量</div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>报名率</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="enrollmentRate" :precision="2" suffix="%">
              <template #title>
                <div class="statistic-title">平均报名率</div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>课程收入</span>
            </div>
          </template>
          <div class="card-content">
            <el-statistic :value="totalRevenue" :precision="2" prefix="¥">
              <template #title>
                <div class="statistic-title">总收入</div>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>课程分布</span>
            </div>
          </template>
          <div class="chart-container">
            <el-progress
              v-for="(count, tag) in tagDistribution"
              :key="tag"
              :percentage="(count / totalSchedules) * 100"
              :format="() => `${tag}: ${count}`"
              :stroke-width="15"
              :color="getTagColor(tag)"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>时段分布</span>
            </div>
          </template>
          <div class="chart-container">
            <el-progress
              v-for="(count, period) in timePeriodDistribution"
              :key="period"
              :percentage="(count / totalSchedules) * 100"
              :format="() => `${period}: ${count}`"
              :stroke-width="15"
              :color="getTimeColor(period)"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ClassSchedule } from '@/types/classroom'

const props = defineProps<{
  schedules: ClassSchedule[]
}>()

// 计算总课程数
const totalSchedules = computed(() => props.schedules.length)

// 计算本月课程数
const monthlySchedules = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return props.schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.startTime)
    return (
      scheduleDate.getMonth() === currentMonth &&
      scheduleDate.getFullYear() === currentYear
    )
  }).length
})

// 计算平均报名率
const enrollmentRate = computed(() => {
  if (props.schedules.length === 0) return 0
  
  const totalRate = props.schedules.reduce((acc, schedule) => {
    return acc + (schedule.enrolledStudents.length / schedule.maxStudents) * 100
  }, 0)
  
  return totalRate / props.schedules.length
})

// 计算总收入
const totalRevenue = computed(() => {
  return props.schedules.reduce((acc, schedule) => {
    return acc + schedule.price * schedule.enrolledStudents.length
  }, 0)
})

// 计算标签分布
const tagDistribution = computed(() => {
  const distribution: Record<string, number> = {}
  
  props.schedules.forEach(schedule => {
    schedule.tags.forEach(tag => {
      distribution[tag] = (distribution[tag] || 0) + 1
    })
  })
  
  return distribution
})

// 计算时段分布
const timePeriodDistribution = computed(() => {
  const distribution: Record<string, number> = {
    '上午 (6:00-12:00)': 0,
    '下午 (12:00-18:00)': 0,
    '晚上 (18:00-24:00)': 0
  }
  
  props.schedules.forEach(schedule => {
    const hour = new Date(schedule.startTime).getHours()
    
    if (hour >= 6 && hour < 12) {
      distribution['上午 (6:00-12:00)']++
    } else if (hour >= 12 && hour < 18) {
      distribution['下午 (12:00-18:00)']++
    } else {
      distribution['晚上 (18:00-24:00)']++
    }
  })
  
  return distribution
})

// 获取标签颜色
const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    '数学': '#409EFF',
    '英语': '#67C23A',
    '物理': '#E6A23C',
    '化学': '#F56C6C',
    '生物': '#909399',
    '历史': '#9B59B6',
    '地理': '#3498DB',
    '政治': '#E74C3C',
    '语文': '#2ECC71'
  }
  
  return colors[tag] || '#909399'
}

// 获取时段颜色
const getTimeColor = (period: string) => {
  const colors: Record<string, string> = {
    '上午 (6:00-12:00)': '#409EFF',
    '下午 (12:00-18:00)': '#67C23A',
    '晚上 (18:00-24:00)': '#E6A23C'
  }
  
  return colors[period] || '#909399'
}
</script>

<style lang="scss" scoped>
.schedule-stats {
  margin-bottom: 20px;

  .el-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-content {
    text-align: center;
  }

  .statistic-title {
    font-size: 14px;
    color: #909399;
  }

  .chart-row {
    margin-top: 20px;
  }

  .chart-container {
    padding: 20px;

    .el-progress {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
