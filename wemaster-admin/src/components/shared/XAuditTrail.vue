<template>
  <div class="x-audit-trail">
    <div class="audit-header">
      <h3>{{ title }}</h3>
      <el-button 
        v-if="showRefresh" 
        :loading="loading" 
        @click="fetchAuditLogs"
        size="small"
      >
        <el-icon><refresh /></el-icon>
        {{ $t('common.refresh') }}
      </el-button>
    </div>
    
    <el-table
      :data="auditLogs"
      :loading="loading"
      :stripe="stripe"
      :border="border"
      style="width: 100%"
    >
      <el-table-column
        prop="createdAt"
        :label="$t('audit.createdAt')"
        width="180"
      >
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
      
      <el-table-column
        prop="userName"
        :label="$t('audit.user')"
        width="120"
      />
      
      <el-table-column
        prop="action"
        :label="$t('audit.action')"
        width="150"
      >
        <template #default="{ row }">
          <el-tag :type="getActionType(row.action)">
            {{ getActionText(row.action) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="resource"
        :label="$t('audit.resource')"
        width="150"
      />
      
      <el-table-column
        prop="resourceId"
        :label="$t('audit.resourceId')"
        width="120"
      />
      
      <el-table-column
        :label="$t('audit.changes')"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <div class="changes-preview" @click="showDetail(row)">
            {{ getChangesPreview(row.changes) }}
          </div>
        </template>
      </el-table-column>
      
      <el-table-column
        prop="ipAddress"
        :label="$t('audit.ip')"
        width="120"
      />
    </el-table>
    
    <div class="audit-pagination" v-if="pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 详细变更对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="$t('audit.changeDetails')"
      width="600px"
    >
      <div class="change-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="$t('audit.field')">
            {{ currentChange?.field }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.oldValue')">
            <pre class="value-display">{{ currentChange?.oldValue }}</pre>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('audit.newValue')">
            <pre class="value-display">{{ currentChange?.newValue }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">
            {{ $t('common.close') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { format } from 'date-fns'

// Props
const props = defineProps({
  resourceId: {
    type: String,
    default: ''
  },
  resourceType: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  showRefresh: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  },
  autoLoad: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['load'])

// State
const auditLogs = ref([])
const loading = ref(false)
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})
const detailVisible = ref(false)
const currentChange = ref(null)

// Methods
const fetchAuditLogs = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    // const response = await api.getAuditLogs({
    //   resourceId: props.resourceId,
    //   resourceType: props.resourceType,
    //   page: pagination.value.currentPage,
    //   pageSize: pagination.value.pageSize
    // })
    // 
    // auditLogs.value = response.data
    // pagination.value.total = response.total
    
    // Mock data for now
    auditLogs.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      userName: `User ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      action: ['CREATE', 'UPDATE', 'DELETE', 'READ'][Math.floor(Math.random() * 4)],
      resource: props.resourceType || 'Resource',
      resourceId: props.resourceId || `ID-${Math.floor(Math.random() * 1000)}`,
      changes: [
        {
          field: 'name',
          oldValue: 'Old Name',
          newValue: 'New Name'
        },
        {
          field: 'status',
          oldValue: 'inactive',
          newValue: 'active'
        }
      ],
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
    }))
    
    pagination.value.total = 1000 // Mock total
    
    emit('load', auditLogs.value)
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    ElMessage.error($t('audit.loadFailed'))
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  return format(new Date(time), 'yyyy-MM-dd HH:mm:ss')
}

const getActionType = (action) => {
  const types = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'danger',
    READ: 'info'
  }
  return types[action] || 'info'
}

const getActionText = (action) => {
  const texts = {
    CREATE: $t('audit.actions.create'),
    UPDATE: $t('audit.actions.update'),
    DELETE: $t('audit.actions.delete'),
    READ: $t('audit.actions.read')
  }
  return texts[action] || action
}

const getChangesPreview = (changes) => {
  if (!changes || changes.length === 0) return ''
  return changes.map(change => `${change.field}: ${change.oldValue} → ${change.newValue}`).join('; ')
}

const showDetail = (row) => {
  // 显示第一个变更的详细信息
  if (row.changes && row.changes.length > 0) {
    currentChange.value = row.changes[0]
    detailVisible.value = true
  }
}

const handleSizeChange = (pageSize) => {
  pagination.value.pageSize = pageSize
  fetchAuditLogs()
}

const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage
  fetchAuditLogs()
}

// Lifecycle
onMounted(() => {
  if (props.autoLoad) {
    fetchAuditLogs()
  }
})
</script>

<style scoped>
.x-audit-trail {
  width: 100%;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.audit-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.changes-preview {
  cursor: pointer;
  color: var(--el-color-primary);
  text-decoration: underline;
}

.change-detail .value-display {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
}

.audit-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>