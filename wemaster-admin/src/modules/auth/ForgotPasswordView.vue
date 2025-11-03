<template>
  <div class="forgot-password-view">
    <h2>{{ $t('auth.forgotPassword.title') }}</h2>
    <x-form
      :model="form"
      :rules="rules"
      @submit="handleSubmit"
    >
      <el-form-item :label="$t('auth.forgotPassword.email')" prop="email">
        <el-input
          v-model="form.email"
          :placeholder="$t('auth.forgotPassword.emailPlaceholder')"
          type="email"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          {{ $t('auth.forgotPassword.submit') }}
        </el-button>
      </el-form-item>
    </x-form>
    <div class="forgot-password-footer">
      <router-link to="/login">
        {{ $t('auth.forgotPassword.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import XForm from '@/components/shared/XForm.vue';

// State
const loading = ref(false);
const form = ref({
  email: ''
});

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ]
};

// Methods
const handleSubmit = async () => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API to send reset password email
    console.log('Forgot password request:', form.value);
    // For now, just simulate success
    setTimeout(() => {
      alert('重置密码链接已发送到您的邮箱');
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Forgot password failed:', error);
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.forgot-password-footer {
  text-align: center;
  margin-top: 20px;
}
</style>