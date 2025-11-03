/**
 * API 使用示例组件
 * 演示如何使用生成的 SDK
 */

<template>
  <div class="api-demo">
    <h2>API Demo</h2>
    
    <!-- 登录表单 -->
    <div class="login-section">
      <h3>Login</h3>
      <form @submit.prevent="handleLogin">
        <input v-model="loginForm.email" type="email" placeholder="Email" required />
        <input v-model="loginForm.password" type="password" placeholder="Password" required />
        <button type="submit" :disabled="loading">Login</button>
      </form>
    </div>

    <!-- 课程列表 -->
    <div class="offerings-section">
      <h3>Offerings</h3>
      <button @click="fetchOfferings" :disabled="loading">Fetch Offerings</button>
      <div v-if="offerings.length > 0" class="offerings-list">
        <div v-for="offering in offerings" :key="offering.id" class="offering-item">
          <h4>{{ offering.title }}</h4>
          <p>{{ offering.description }}</p>
          <p>Price: ${{ offering.price }}</p>
        </div>
      </div>
    </div>

    <!-- 错误显示 -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authApi, offeringsApi } from '@/api'

// 响应式数据
const loading = ref(false)
const error = ref('')
const offerings = ref([])

// 登录表单
const loginForm = ref({
  email: '',
  password: ''
})

// 登录处理
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await authApi.authControllerLogin(loginForm.value)
    
    // 保存 token
    localStorage.setItem('authToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    
    console.log('Login successful:', response.data)
    
    // 登录成功后获取课程列表
    await fetchOfferings()
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

// 获取课程列表
const fetchOfferings = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await offeringsApi.offeringsControllerFindAll()
    offerings.value = response.data
    console.log('Offerings fetched:', response.data)
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch offerings'
    console.error('Offerings error:', err)
  } finally {
    loading.value = false
  }
}

// 组件挂载时检查是否已登录
onMounted(() => {
  const token = localStorage.getItem('authToken')
  if (token) {
    fetchOfferings()
  }
})
</script>

<style scoped>
.api-demo {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.login-section, .offerings-section {
  margin-bottom: 30px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.offerings-list {
  margin-top: 15px;
}

.offering-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>