<template>
  <div class="integration-stripe">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>Stripe 配置</span>
        </div>
      </template>
      
      <x-form
        :model="stripeConfig"
        :rules="rules"
        label-width="150px"
        @submit="handleSave"
        @reset="handleReset"
      >
        <el-form-item label="Secret Key" prop="secretKey">
          <el-input v-model="stripeConfig.secretKey" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="Publishable Key" prop="publishableKey">
          <el-input v-model="stripeConfig.publishableKey" />
        </el-form-item>
        
        <el-form-item label="Webhook Secret" prop="webhookSecret">
          <el-input v-model="stripeConfig.webhookSecret" type="password" show-password />
        </el-form-item>
        
        <el-form-item label="Connect Client ID" prop="connectClientId">
          <el-input v-model="stripeConfig.connectClientId" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch
            v-model="stripeConfig.enabled"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleTestConnection">
            测试连接
          </el-button>
          <el-button type="success" @click="handleSave">
            保存配置
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </x-form>
    </el-card>
    
    <el-card class="webhook-card">
      <template #header>
        <div class="card-header">
          <span>Webhook 配置</span>
        </div>
      </template>
      
      <div class="webhook-info">
        <p>请将以下 URL 配置到 Stripe Dashboard 的 Webhook 设置中：</p>
        <el-input :value="webhookUrl" readonly>
          <template #append>
            <el-button @click="handleCopyWebhookUrl">
              复制
            </el-button>
          </template>
        </el-input>
        
        <div class="webhook-events">
          <h4>需要订阅的事件：</h4>
          <el-checkbox-group v-model="subscribedEvents">
            <el-checkbox 
              v-for="event in stripeEvents" 
              :key="event" 
              :label="event"
            >
              {{ event }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XForm from '@/components/shared/XForm.vue';

// State
const stripeConfig = ref({
  secretKey: '',
  publishableKey: '',
  webhookSecret: '',
  connectClientId: '',
  enabled: false
});

const rules = ref({
  secretKey: [
    { required: true, message: '请输入 Secret Key', trigger: 'blur' }
  ],
  publishableKey: [
    { required: true, message: '请输入 Publishable Key', trigger: 'blur' }
  ],
  webhookSecret: [
    { required: true, message: '请输入 Webhook Secret', trigger: 'blur' }
  ],
  connectClientId: [
    { required: true, message: '请输入 Connect Client ID', trigger: 'blur' }
  ]
});

const webhookUrl = ref('https://your-domain.com/api/v1/payments/webhooks/stripe');
const subscribedEvents = ref([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

const stripeEvents = ref([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'payout.created',
  'payout.failed',
  'payout.paid'
]);

// Methods
const handleSave = () => {
  // Handle save configuration
  console.log('Save Stripe configuration:', stripeConfig.value);
};

const handleReset = () => {
  // Handle reset configuration
  stripeConfig.value = {
    secretKey: '',
    publishableKey: '',
    webhookSecret: '',
    connectClientId: '',
    enabled: false
  };
};

const handleTestConnection = () => {
  // Handle test connection
  console.log('Test Stripe connection');
};

const handleCopyWebhookUrl = () => {
  // Handle copy webhook URL
  navigator.clipboard.writeText(webhookUrl.value);
  console.log('Copied webhook URL to clipboard');
};

// Lifecycle
onMounted(() => {
  // In a real implementation, you would fetch the current configuration
  console.log('Fetch Stripe configuration');
});
</script>

<style scoped>
.integration-stripe {
  padding: 20px;
}

.config-card, .webhook-card {
  margin-bottom: 20px;
  border-radius: var(--border-radius-base);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.webhook-info p {
  margin-bottom: 10px;
}

.webhook-events {
  margin-top: 20px;
}

.webhook-events h4 {
  margin-bottom: 10px;
}
</style>