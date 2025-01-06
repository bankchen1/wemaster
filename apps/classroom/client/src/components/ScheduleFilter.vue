<template>
  <div class="schedule-filter">
    <el-form :model="filterForm" inline>
      <el-form-item label="搜索">
        <el-input
          v-model="filterForm.keyword"
          placeholder="搜索课程标题或描述"
          clearable
          @input="handleFilter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="标签">
        <el-select
          v-model="filterForm.tags"
          multiple
          clearable
          collapse-tags
          placeholder="选择标签"
          @change="handleFilter"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="价格范围">
        <el-input-number
          v-model="filterForm.minPrice"
          :min="0"
          :step="10"
          placeholder="最低价"
          @change="handleFilter"
        />
        <span class="separator">-</span>
        <el-input-number
          v-model="filterForm.maxPrice"
          :min="0"
          :step="10"
          placeholder="最高价"
          @change="handleFilter"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-select
          v-model="filterForm.status"
          clearable
          placeholder="课程状态"
          @change="handleFilter"
        >
          <el-option label="已预约" value="scheduled" />
          <el-option label="已取消" value="cancelled" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </el-form-item>

      <el-form-item label="排序">
        <el-select
          v-model="filterForm.sort"
          placeholder="排序方式"
          @change="handleFilter"
        >
          <el-option label="时间升序" value="timeAsc" />
          <el-option label="时间降序" value="timeDesc" />
          <el-option label="价格升序" value="priceAsc" />
          <el-option label="价格降序" value="priceDesc" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { ClassSchedule } from '@/types/classroom'

interface FilterForm {
  keyword: string
  tags: string[]
  minPrice: number | null
  maxPrice: number | null
  status: string
  sort: string
}

const props = defineProps<{
  schedules: ClassSchedule[]
}>()

const emit = defineEmits<{
  (e: 'filter', schedules: ClassSchedule[]): void
}>()

const filterForm = ref<FilterForm>({
  keyword: '',
  tags: [],
  minPrice: null,
  maxPrice: null,
  status: '',
  sort: 'timeAsc'
})

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

const handleFilter = () => {
  let filtered = [...props.schedules]

  // 关键词搜索
  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    filtered = filtered.filter(
      schedule =>
        schedule.title.toLowerCase().includes(keyword) ||
        schedule.description.toLowerCase().includes(keyword)
    )
  }

  // 标签筛选
  if (filterForm.value.tags.length > 0) {
    filtered = filtered.filter(schedule =>
      filterForm.value.tags.some(tag => schedule.tags.includes(tag))
    )
  }

  // 价格范围筛选
  if (filterForm.value.minPrice !== null) {
    filtered = filtered.filter(schedule => schedule.price >= (filterForm.value.minPrice || 0))
  }
  if (filterForm.value.maxPrice !== null) {
    filtered = filtered.filter(schedule => schedule.price <= (filterForm.value.maxPrice || Infinity))
  }

  // 状态筛选
  if (filterForm.value.status) {
    filtered = filtered.filter(schedule => schedule.status === filterForm.value.status)
  }

  // 排序
  filtered.sort((a, b) => {
    switch (filterForm.value.sort) {
      case 'timeAsc':
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      case 'timeDesc':
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      case 'priceAsc':
        return a.price - b.price
      case 'priceDesc':
        return b.price - a.price
      default:
        return 0
    }
  })

  emit('filter', filtered)
}

const handleReset = () => {
  filterForm.value = {
    keyword: '',
    tags: [],
    minPrice: null,
    maxPrice: null,
    status: '',
    sort: 'timeAsc'
  }
  handleFilter()
}

// 监听schedules变化
watch(() => props.schedules, handleFilter, { deep: true })
</script>

<style lang="scss" scoped>
.schedule-filter {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .separator {
    margin: 0 8px;
    color: #909399;
  }
}
</style>
