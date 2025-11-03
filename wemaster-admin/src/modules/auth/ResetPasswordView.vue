<template>
  <div class="reset-password-view">
    <h2>{{ $t('auth.resetPassword.title') }}</h2>
    <x-form
      :model="form"
      :rules="rules"
      @submit="handleSubmit"
    >
      <el-form-item :label="$t('auth.resetPassword.newPassword')" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          :placeholder="$t('auth.resetPassword.newPasswordPlaceholder')"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item :label="$t('auth.resetPassword.confirmPassword')" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          :placeholder="$t('auth.resetPassword.confirmPasswordPlaceholder')"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
        >
          {{ $t('auth.resetPassword.submit') }}
        </el-button>
      </el-form-item>
    </x-form>
    <div class="reset-password-footer">
      <router-link to="/login">
        {{ $t('auth.resetPassword.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import XForm from '@/components/shared/XForm.vue';

const route = useRoute();
const router = useRouter();

// State
const loading = ref(false);
const form = ref({
  newPassword: '',
  confirmPassword: ''
});

const rules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// Methods
const handleSubmit = async () => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API to reset password
    console.log('Reset password request:', form.value, route.query.token);
    // For now, just simulate success
    setTimeout(() => {
      alert('密码重置成功');
      router.push('/login');
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Reset password failed:', error);
    loading.value = false;
  }
};
</script>

<style scoped>
.reset-password-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.reset-password-footer {
  text-align: center;
  margin-top: 20px;
}
</style>