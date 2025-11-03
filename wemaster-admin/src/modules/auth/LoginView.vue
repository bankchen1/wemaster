<template>
  <div class="login-view">
    <h2>Login</h2>
    <x-form
      :model="loginForm"
      :rules="loginRules"
      @submit="handleLogin"
    >
      <el-form-item label="Email" prop="email">
        <el-input
          v-model="loginForm.email"
          placeholder="Enter your email"
          type="email"
        />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input
          v-model="loginForm.password"
          placeholder="Enter your password"
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
          Login
        </el-button>
      </el-form-item>
    </x-form>
    <div class="login-footer">
      <router-link to="/login/forgot-password">
        Forgot Password?
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import XForm from '@/components/shared/XForm.vue';

const router = useRouter();
const userStore = useUserStore();

// State
const loading = ref(false);
const loginForm = ref({
  email: '',
  password: ''
});

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
};

// Methods
const handleLogin = async () => {
  loading.value = true;
  try {
    // Simulate a successful login
    setTimeout(() => {
      userStore.setUser({
        id: 1,
        name: 'Admin User',
        email: loginForm.value.email,
        roles: ['ADMIN'],
        permissions: ['dashboard.view', 'users.view', 'courses.view']
      });
      router.push('/dashboard');
    }, 1000);
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-view {
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}
</style>