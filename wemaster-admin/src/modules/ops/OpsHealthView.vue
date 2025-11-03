<template>
  <div class="ops-health-view">
    <h2>{{ $t('ops.health.title') }}</h2>
    <div class="health-header">
      <el-button type="primary" @click="handleRefresh">
        {{ $t('ops.health.actions.refresh') }}
      </el-button>
    </div>
    <div class="health-status">
      <el-card class="status-card" :class="{ 'status-ok': healthStatus.overall === 'ok' }">
        <div class="status-header">
          <el-icon v-if="healthStatus.overall === 'ok'" class="status-icon">
            <Check />
          </el-icon>
          <el-icon v-else class="status-icon">
            <Close />
          </el-icon>
          <div class="status-title">{{ $t('ops.health.overallStatus') }}</div>
          <div class="status-value">{{ healthStatus.overall }}</div>
        </div>
      </el-card>
    </div>
    <div class="health-components">
      <el-card
        v-for="component in healthStatus.components"
        :key="component.name"
        class="component-card"
        :class="{ 'status-ok': component.status === 'ok' }"
      >
        <div class="component-header">
          <el-icon v-if="component.status === 'ok'" class="status-icon">
            <Check />
          </el-icon>
          <el-icon v-else class="status-icon">
            <Close />
          </el-icon>
          <div class="component-title">{{ component.name }}</div>
          <div class="component-status">{{ component.status }}</div>
        </div>
        <div class="component-details">
          <div class="detail-item">
            <span class="detail-label">{{ $t('ops.health.latency') }}:</span>
            <span class="detail-value">{{ component.latency }}ms</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('ops.health.lastCheck') }}:</span>
            <span class="detail-value">{{ component.lastCheck }}</span>
          </div>
          <div v-if="component.message" class="detail-item">
            <span class="detail-label">{{ $t('ops.health.message') }}:</span>
            <span class="detail-value">{{ component.message }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Check, Close } from '@element-plus/icons-vue';

// State
const healthStatus = ref({
  overall: 'ok',
  components: []
});

// Methods
const handleRefresh = () => {
  console.log('Refresh health status');
  fetchHealthStatus();
};

const fetchHealthStatus = async () => {
  try {
    // Mock data
    healthStatus.value = {
      overall: Math.random() > 0.1 ? 'ok' : 'error',
      components: [
        {
          name: 'Database',
          status: Math.random() > 0.05 ? 'ok' : 'error',
          latency: Math.floor(Math.random() * 100),
          lastCheck: new Date().toISOString(),
          message: Math.random() > 0.9 ? 'Connection timeout' : null
        },
        {
          name: 'Redis',
          status: Math.random() > 0.05 ? 'ok' : 'error',
          latency: Math.floor(Math.random() * 50),
          lastCheck: new Date().toISOString(),
          message: Math.random() > 0.95 ? 'High memory usage' : null
        },
        {
          name: 'Stripe API',
          status: Math.random() > 0.1 ? 'ok' : 'error',
          latency: Math.floor(Math.random() * 200),
          lastCheck: new Date().toISOString(),
          message: Math.random() > 0.98 ? 'Rate limited' : null
        },
        {
          name: 'S3 Storage',
          status: Math.random() > 0.05 ? 'ok' : 'error',
          latency: Math.floor(Math.random() * 150),
          lastCheck: new Date().toISOString(),
          message: Math.random() > 0.95 ? 'Slow response' : null
        },
        {
          name: 'LiveKit',
          status: Math.random() > 0.1 ? 'ok' : 'error',
          latency: Math.floor(Math.random() * 300),
          lastCheck: new Date().toISOString(),
          message: Math.random() > 0.9 ? 'Connection issues' : null
        }
      ]
    };
  } catch (error) {
    console.error('Failed to fetch health status:', error);
  }
};

// Lifecycle
onMounted(() => {
  fetchHealthStatus();
});
</script>

<style scoped>
.ops-health-view {
  padding: 20px;
}

.health-header {
  margin-bottom: 20px;
}

.health-status {
  margin-bottom: 30px;
}

.status-card {
  padding: 30px;
  text-align: center;
  border-left: 5px solid var(--color-danger);
}

.status-card.status-ok {
  border-left-color: var(--color-success);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.status-icon {
  font-size: 32px;
}

.status-icon.el-icon-check {
  color: var(--color-success);
}

.status-icon.el-icon-close {
  color: var(--color-danger);
}

.status-title {
  font-size: 18px;
  font-weight: bold;
}

.status-value {
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-value.ok {
  color: var(--color-success);
}

.status-value.error {
  color: var(--color-danger);
}

.health-components {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.component-card {
  border-left: 3px solid var(--color-danger);
}

.component-card.status-ok {
  border-left-color: var(--color-success);
}

.component-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.component-title {
  font-weight: bold;
  flex: 1;
}

.component-status {
  text-transform: uppercase;
  font-weight: bold;
}

.component-status.ok {
  color: var(--color-success);
}

.component-status.error {
  color: var(--color-danger);
}

.component-details {
  font-size: 14px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: bold;
  width: 100px;
}

.detail-value {
  flex: 1;
}
</style>