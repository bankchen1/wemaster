<template>
  <div class="logo-container">
    <img :src="logoUrl" :style="logoStyle" alt="WeMaster Logo" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  size?: 'small' | 'medium' | 'large';
}>();

// 根据不同场景定义logo尺寸
const sizes = {
  small: { width: '32px', height: '32px' },
  medium: { width: '48px', height: '48px' },
  large: { width: '64px', height: '64px' }
};

const logoStyle = computed(() => ({
  width: sizes[props.size || 'medium'].width,
  height: sizes[props.size || 'medium'].height,
  objectFit: 'contain' as const
}));

const logoUrl = '/we.png';
</script>

<style scoped>
.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
