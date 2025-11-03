<template>
  <el-tag 
    :type="tagType" 
    :effect="effect" 
    :size="size"
    :closable="closable"
    :disable-transitions="disableTransitions"
    :hit="hit"
    :color="color"
    :class="customClass"
    @close="handleClose"
  >
    <slot>{{ displayText }}</slot>
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  status: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: '' // success | warning | danger | info
  },
  effect: {
    type: String,
    default: 'light' // light | dark | plain
  },
  size: {
    type: String,
    default: 'default' // large | default | small
  },
  closable: {
    type: Boolean,
    default: false
  },
  disableTransitions: {
    type: Boolean,
    default: false
  },
  hit: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: ''
  },
  textMap: {
    type: Object,
    default: () => ({})
  },
  typeMap: {
    type: Object,
    default: () => ({})
  },
  customClass: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close', 'click'])

// Computed
const displayText = computed(() => {
  return props.textMap[props.status] || props.status
})

const tagType = computed(() => {
  if (props.type) return props.type
  return props.typeMap[props.status] || 'info'
})

// Methods
const handleClose = (event) => {
  emit('close', event)
}
</script>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>