<template>
  <div class="x-form">
    <el-form
      :model="model"
      :rules="rules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      @submit.prevent="handleSubmit"
    >
      <slot></slot>
      
      <el-form-item v-if="showActions">
        <el-button 
          type="primary" 
          :loading="submitting" 
          @click="handleSubmit"
        >
          {{ submitText || 'Submit' }}
        </el-button>
        <el-button @click="handleReset" v-if="showReset">
          {{ resetText || 'Reset' }}
        </el-button>
        <el-button @click="handleCancel" v-if="showCancel">
          {{ cancelText || 'Cancel' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props
const props = defineProps({
  model: {
    type: Object,
    required: true
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  labelWidth: {
    type: [String, Number],
    default: '120px'
  },
  labelPosition: {
    type: String,
    default: 'right'
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showReset: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  submitText: {
    type: String,
    default: ''
  },
  resetText: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: ''
  },
  submitting: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['submit', 'reset', 'cancel']);

// Methods
const handleSubmit = () => {
  emit('submit', props.model);
};

const handleReset = () => {
  emit('reset');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.x-form {
  background-color: var(--bg-container);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-base);
  padding: var(--spacing-md);
}
</style>