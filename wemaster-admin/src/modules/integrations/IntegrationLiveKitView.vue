<template>
  <div class="integration-livekit-view">
    <h2>{{ $t('integrations.livekit.title') }}</h2>
    <el-form
      :model="livekitConfig"
      :rules="rules"
      label-width="120px"
      @submit.prevent="handleSave"
    >
      <el-form-item :label="$t('integrations.livekit.serverUrl')" prop="serverUrl">
        <el-input
          v-model="livekitConfig.serverUrl"
          :placeholder="$t('integrations.livekit.serverUrlPlaceholder')"
        />
      </el-form-item>
      
      <el-form-item :label="$t('integrations.livekit.apiKey')" prop="apiKey">
        <el-input
          v-model="livekitConfig.apiKey"
          :placeholder="$t('integrations.livekit.apiKeyPlaceholder')"
        />
      </el-form-item>
      
      <el-form-item :label="$t('integrations.livekit.apiSecret')" prop="apiSecret">
        <el-input
          v-model="livekitConfig.apiSecret"
          type="password"
          :placeholder="$t('integrations.livekit.apiSecretPlaceholder')"
          show-password
        />
      </el-form-item>
      
      <el-form-item :label="$t('integrations.livekit.roomLimits')" prop="roomLimits">
        <el-input-number
          v-model="livekitConfig.roomLimits"
          :min="1"
          :max="1000"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          :loading="saving"
        >
          {{ $t('integrations.livekit.actions.save') }}
        </el-button>
        <el-button @click="handleTestConnection" :loading="testing">
          {{ $t('integrations.livekit.actions.test') }}
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="connection-status">
      <h3>{{ $t('integrations.livekit.connectionStatus') }}</h3>
      <el-tag :type="connectionStatus.type">
        {{ connectionStatus.message }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// State
const livekitConfig = ref({
  serverUrl: '',
  apiKey: '',
  apiSecret: '',
  roomLimits: 100
});
const saving = ref(false);
const testing = ref(false);
const connectionStatus = ref({
  type: 'info',
  message: '未测试'
});

const rules = {
  serverUrl: [
    { required: true, message: '请输入服务器URL', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: '请输入API Key', trigger: 'blur' }
  ],
  apiSecret: [
    { required: true, message: '请输入API Secret', trigger: 'blur' }
  ]
};

// Methods
const handleSave = async () => {
  saving.value = true;
  try {
    // In a real implementation, you would call the API to save the configuration
    console.log('Save LiveKit configuration:', livekitConfig.value);
    setTimeout(() => {
      alert('LiveKit配置保存成功');
      saving.value = false;
    }, 1000);
  } catch (error) {
    console.error('Failed to save LiveKit configuration:', error);
    saving.value = false;
  }
};

const handleTestConnection = async () => {
  testing.value = true;
  try {
    // In a real implementation, you would call the API to test the connection
    console.log('Test LiveKit connection:', livekitConfig.value);
    setTimeout(() => {
      connectionStatus.value = {
        type: 'success',
        message: '连接成功'
      };
      testing.value = false;
    }, 1000);
  } catch (error) {
    console.error('Failed to test LiveKit connection:', error);
    connectionStatus.value = {
      type: 'danger',
      message: '连接失败'
    };
    testing.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // In a real implementation, you would fetch the current LiveKit configuration
  console.log('Fetching LiveKit configuration');
});
</script>

<style scoped>
.integration-livekit-view {
  padding: 20px;
  max-width: 600px;
}

.connection-status {
  margin-top: 30px;
}

.connection-status h3 {
  margin-top: 0;
}
</style>