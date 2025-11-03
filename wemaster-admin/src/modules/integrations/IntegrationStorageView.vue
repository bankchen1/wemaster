<template>
  <div class="integration-storage-view">
    <h2>{{ $t('integrations.storage.title') }}</h2>
    <el-form
      :model="storageConfig"
      :rules="rules"
      label-width="120px"
      @submit.prevent="handleSave"
    >
      <el-form-item :label="$t('integrations.storage.provider')" prop="provider">
        <el-select
          v-model="storageConfig.provider"
          :placeholder="$t('integrations.storage.providerPlaceholder')"
        >
          <el-option
            v-for="provider in providers"
            :key="provider.value"
            :label="provider.label"
            :value="provider.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item :label="$t('integrations.storage.accessKeyId')" prop="accessKeyId">
        <el-input
          v-model="storageConfig.accessKeyId"
          :placeholder="$t('integrations.storage.accessKeyIdPlaceholder')"
        />
      </el-form-item>
      
      <el-form-item :label="$t('integrations.storage.secretAccessKey')" prop="secretAccessKey">
        <el-input
          v-model="storageConfig.secretAccessKey"
          type="password"
          :placeholder="$t('integrations.storage.secretAccessKeyPlaceholder')"
          show-password
        />
      </el-form-item>
      
      <el-form-item :label="$t('integrations.storage.region')" prop="region">
        <el-input
          v-model="storageConfig.region"
          :placeholder="$t('integrations.storage.regionPlaceholder')"
        />
      </el-form-item>
      
      <el-form-item :label="$t('integrations.storage.bucket')" prop="bucket">
        <el-input
          v-model="storageConfig.bucket"
          :placeholder="$t('integrations.storage.bucketPlaceholder')"
        />
      </el-form-item>
      
      <el-form-item :label="$t('integrations.storage.endpoint')" prop="endpoint">
        <el-input
          v-model="storageConfig.endpoint"
          :placeholder="$t('integrations.storage.endpointPlaceholder')"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          :loading="saving"
        >
          {{ $t('integrations.storage.actions.save') }}
        </el-button>
        <el-button @click="handleTestConnection" :loading="testing">
          {{ $t('integrations.storage.actions.test') }}
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="connection-status">
      <h3>{{ $t('integrations.storage.connectionStatus') }}</h3>
      <el-tag :type="connectionStatus.type">
        {{ connectionStatus.message }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// State
const storageConfig = ref({
  provider: 's3',
  accessKeyId: '',
  secretAccessKey: '',
  region: '',
  bucket: '',
  endpoint: ''
});
const saving = ref(false);
const testing = ref(false);
const connectionStatus = ref({
  type: 'info',
  message: '未测试'
});
const providers = ref([
  { value: 's3', label: 'Amazon S3' },
  { value: 'oss', label: '阿里云 OSS' },
  { value: 'cos', label: '腾讯云 COS' },
  { value: 'minio', label: 'MinIO' }
]);

const rules = {
  provider: [
    { required: true, message: '请选择存储提供商', trigger: 'change' }
  ],
  accessKeyId: [
    { required: true, message: '请输入Access Key ID', trigger: 'blur' }
  ],
  secretAccessKey: [
    { required: true, message: '请输入Secret Access Key', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请输入区域', trigger: 'blur' }
  ],
  bucket: [
    { required: true, message: '请输入存储桶名称', trigger: 'blur' }
  ]
};

// Methods
const handleSave = async () => {
  saving.value = true;
  try {
    // In a real implementation, you would call the API to save the configuration
    console.log('Save storage configuration:', storageConfig.value);
    setTimeout(() => {
      alert('存储配置保存成功');
      saving.value = false;
    }, 1000);
  } catch (error) {
    console.error('Failed to save storage configuration:', error);
    saving.value = false;
  }
};

const handleTestConnection = async () => {
  testing.value = true;
  try {
    // In a real implementation, you would call the API to test the connection
    console.log('Test storage connection:', storageConfig.value);
    setTimeout(() => {
      connectionStatus.value = {
        type: 'success',
        message: '连接成功'
      };
      testing.value = false;
    }, 1000);
  } catch (error) {
    console.error('Failed to test storage connection:', error);
    connectionStatus.value = {
      type: 'danger',
      message: '连接失败'
    };
    testing.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // In a real implementation, you would fetch the current storage configuration
  console.log('Fetching storage configuration');
});
</script>

<style scoped>
.integration-storage-view {
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