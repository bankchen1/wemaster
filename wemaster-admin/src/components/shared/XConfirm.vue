<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    @close="handleCancel"
  >
    <div class="confirm-content">
      <div v-if="icon" class="confirm-icon">
        <el-icon :size="24" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="confirm-message">
        <p>{{ message }}</p>
        <div v-if="requireInput" class="confirm-input">
          <el-input
            v-model="confirmText"
            :placeholder="inputPlaceholder"
            @keyup.enter="handleConfirm"
          />
          <p v-if="inputError" class="input-error">{{ inputError }}</p>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="loading">
          {{ cancelText }}
        </el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm" 
          :loading="loading"
          :disabled="confirmDisabled"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Warning, SuccessFilled, CircleCloseFilled, InfoFilled } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'warning' // warning | success | error | info
  },
  confirmButtonText: {
    type: String,
    default: ''
  },
  cancelButtonText: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '420px'
  },
  showClose: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  requireInput: {
    type: Boolean,
    default: false
  },
  inputPattern: {
    type: RegExp,
    default: null
  },
  inputValidator: {
    type: Function,
    default: null
  },
  inputErrorMessage: {
    type: String,
    default: ''
  },
  inputPlaceholder: {
    type: String,
    default: ''
  },
  confirmKeyword: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// State
const visible = ref(false)
const confirmText = ref('')
const inputError = ref('')

// Computed
const icon = computed(() => {
  const icons = {
    warning: Warning,
    success: SuccessFilled,
    error: CircleCloseFilled,
    info: InfoFilled
  }
  return icons[props.type]
})

const iconColor = computed(() => {
  const colors = {
    warning: '#e6a23c',
    success: '#67c23a',
    error: '#f56c6c',
    info: '#409eff'
  }
  return colors[props.type]
})

const confirmDisabled = computed(() => {
  if (props.loading) return true
  if (!props.requireInput) return false
  
  // 检查输入验证
  if (props.confirmKeyword && confirmText.value !== props.confirmKeyword) {
    return true
  }
  
  if (props.inputPattern && !props.inputPattern.test(confirmText.value)) {
    return true
  }
  
  if (props.inputValidator && !props.inputValidator(confirmText.value)) {
    return true
  }
  
  return false
})

const confirmText = computed(() => {
  return props.confirmButtonText || $t('common.confirm')
})

const cancelText = computed(() => {
  return props.cancelButtonText || $t('common.cancel')
})

// Methods
const handleConfirm = () => {
  if (confirmDisabled.value) return
  
  // 验证输入
  if (props.requireInput) {
    if (props.confirmKeyword && confirmText.value !== props.confirmKeyword) {
      inputError.value = props.inputErrorMessage || $t('common.confirm.keywordError')
      return
    }
    
    if (props.inputPattern && !props.inputPattern.test(confirmText.value)) {
      inputError.value = props.inputErrorMessage || $t('common.confirm.patternError')
      return
    }
    
    if (props.inputValidator) {
      const result = props.inputValidator(confirmText.value)
      if (result !== true) {
        inputError.value = result || props.inputErrorMessage || $t('common.confirm.validatorError')
        return
      }
    }
  }
  
  emit('confirm', confirmText.value)
  reset()
}

const handleCancel = () => {
  emit('cancel')
  reset()
}

const reset = () => {
  visible.value = false
  emit('update:modelValue', false)
  confirmText.value = ''
  inputError.value = ''
}

// Watch
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(visible, (newVal) => {
  if (!newVal) {
    reset()
  }
})

watch(confirmText, () => {
  inputError.value = ''
})
</script>

<style scoped>
.confirm-content {
  display: flex;
  align-items: flex-start;
  padding: 20px 0;
}

.confirm-icon {
  margin-right: 16px;
  margin-top: 2px;
}

.confirm-message p {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.confirm-input {
  margin-top: 16px;
}

.input-error {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--el-color-danger);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>