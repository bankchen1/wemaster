<template>
  <div class="x-filter">
    <el-form :model="filterModel" label-position="top">
      <el-row :gutter="20">
        <el-col :span="6" v-for="field in fields" :key="field.key">
          <el-form-item :label="field.label">
            <!-- Text input -->
            <el-input
              v-if="field.type === 'text'"
              v-model="filterModel[field.key]"
              :placeholder="field.placeholder"
              clearable
              @clear="handleClear(field.key)"
            />
            
            <!-- Select -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="filterModel[field.key]"
              :placeholder="field.placeholder"
              clearable
              @clear="handleClear(field.key)"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            
            <!-- Date range -->
            <el-date-picker
              v-else-if="field.type === 'date-range'"
              v-model="filterModel[field.key]"
              type="daterange"
              :placeholder="field.placeholder"
              :start-placeholder="field.startPlaceholder"
              :end-placeholder="field.endPlaceholder"
              clearable
              @clear="handleClear(field.key)"
            />
            
            <!-- Custom slot -->
            <slot 
              v-else
              :name="field.key"
              :value="filterModel[field.key]"
              :field="field"
              @update:value="updateFilterValue(field.key, $event)"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// Props
const props = defineProps({
  fields: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'search', 'reset']);

// Data
const filterModel = reactive({ ...props.modelValue });

// Methods
const handleSearch = () => {
  emit('search', { ...filterModel });
};

const handleReset = () => {
  // Reset all fields
  Object.keys(filterModel).forEach(key => {
    filterModel[key] = undefined;
  });
  
  emit('reset');
  emit('update:modelValue', { ...filterModel });
};

const handleClear = (key) => {
  filterModel[key] = undefined;
  emit('update:modelValue', { ...filterModel });
};

const updateFilterValue = (key, value) => {
  filterModel[key] = value;
  emit('update:modelValue', { ...filterModel });
};
</script>

<style scoped>
.x-filter {
  background-color: var(--bg-container);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-base);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}
</style>