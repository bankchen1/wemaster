<template>
  <div class="user-roles-view">
    <div class="roles-header">
      <h2>{{ $t('users.roles.title') }}</h2>
      <el-button type="primary" @click="handleCreateRole">
        {{ $t('users.roles.actions.create') }}
      </el-button>
    </div>
    
    <x-filter
      :fields="filterFields"
      v-model="filterModel"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <x-table
      :data="roles"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    >
      <el-table-column prop="id" :label="$t('users.roles.fields.id')" width="180" />
      <el-table-column prop="name" :label="$t('users.roles.fields.name')" width="200" />
      <el-table-column prop="description" :label="$t('users.roles.fields.description')" />
      <el-table-column prop="createdAt" :label="$t('users.roles.fields.createdAt')" width="180" />
      <el-table-column :label="$t('common.actions')" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEditRole(row)">
            {{ $t('common.edit') }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDeleteRole(row)">
            {{ $t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </x-table>
    
    <!-- Role Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="120px"
      >
        <el-form-item :label="$t('users.roles.fields.name')" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item :label="$t('users.roles.fields.description')" prop="description">
          <el-input v-model="roleForm.description" type="textarea" />
        </el-form-item>
        <el-form-item :label="$t('users.roles.fields.permissions')" prop="permissions">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :props="treeProps"
            :default-checked-keys="roleForm.permissions"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">
            {{ $t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="handleSaveRole">
            {{ $t('common.save') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import XFilter from '@/components/shared/XFilter.vue'
import XTable from '@/components/shared/XTable.vue'

// Refs
const roleFormRef = ref(null)
const permissionTreeRef = ref(null)

// State
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditing = ref(false)
const currentRoleId = ref('')

const loading = ref(false)
const roles = ref([])
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const filterModel = ref({})
const filterFields = ref([
  {
    key: 'keyword',
    label: $t('common.keyword'),
    type: 'text',
    placeholder: $t('users.roles.filter.keyword')
  }
])

const roleForm = ref({
  name: '',
  description: '',
  permissions: []
})

const roleFormRules = {
  name: [
    { required: true, message: $t('users.roles.validation.nameRequired'), trigger: 'blur' }
  ]
}

const treeProps = {
  children: 'children',
  label: 'label'
}

const permissionTree = ref([
  {
    id: 'dashboard',
    label: $t('permissions.dashboard'),
    children: [
      { id: 'dashboard.view', label: $t('permissions.dashboard.view') }
    ]
  },
  {
    id: 'users',
    label: $t('permissions.users'),
    children: [
      { id: 'users.view', label: $t('permissions.users.view') },
      { id: 'users.write', label: $t('permissions.users.write') },
      { id: 'users.kyc', label: $t('permissions.users.kyc') },
      { id: 'users.role.assign', label: $t('permissions.users.role.assign') }
    ]
  },
  {
    id: 'tutors',
    label: $t('permissions.tutors'),
    children: [
      { id: 'tutors.view', label: $t('permissions.tutors.view') },
      { id: 'tutors.write', label: $t('permissions.tutors.write') },
      { id: 'tutors.review', label: $t('permissions.tutors.review') },
      { id: 'tutors.schedule', label: $t('permissions.tutors.schedule') }
    ]
  }
])

// Methods
const fetchRoles = async (params = {}) => {
  loading.value = true
  try {
    // Mock data
    roles.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `ROLE${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `Role ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      description: `Description for role ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }))
    
    pagination.value.total = 100 // Mock total
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    ElMessage.error($t('users.roles.loadFailed'))
  } finally {
    loading.value = false
  }
}

const handleSearch = (filters) => {
  filterModel.value = filters
  pagination.value.currentPage = 1
  fetchRoles({ ...filters, page: 1, pageSize: pagination.value.pageSize })
}

const handleReset = () => {
  filterModel.value = {}
  pagination.value.currentPage = 1
  fetchRoles({ page: 1, pageSize: pagination.value.pageSize })
}

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page
  pagination.value.pageSize = pageSize
  fetchRoles({ ...filterModel.value, page, pageSize })
}

const handleCreateRole = () => {
  dialogTitle.value = $t('users.roles.actions.create')
  isEditing.value = false
  roleForm.value = {
    name: '',
    description: '',
    permissions: []
  }
  dialogVisible.value = true
}

const handleEditRole = (role) => {
  dialogTitle.value = $t('users.roles.actions.edit')
  isEditing.value = true
  currentRoleId.value = role.id
  roleForm.value = {
    name: role.name,
    description: role.description,
    permissions: [] // In a real implementation, fetch role permissions
  }
  dialogVisible.value = true
}

const handleDeleteRole = (role) => {
  ElMessageBox.confirm(
    $t('users.roles.confirm.delete', { name: role.name }),
    $t('common.confirm'),
    {
      type: 'warning'
    }
  ).then(() => {
    // In a real implementation, call API to delete role
    ElMessage.success($t('users.roles.deleteSuccess'))
    fetchRoles()
  }).catch(() => {
    // Cancelled
  })
}

const handleSaveRole = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      // Get checked permissions
      const checkedKeys = permissionTreeRef.value.getCheckedKeys()
      const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
      const permissions = [...checkedKeys, ...halfCheckedKeys]
      
      if (isEditing.value) {
        // In a real implementation, call API to update role
        console.log('Update role:', currentRoleId.value, roleForm.value, permissions)
      } else {
        // In a real implementation, call API to create role
        console.log('Create role:', roleForm.value, permissions)
      }
      
      ElMessage.success(isEditing.value ? $t('users.roles.updateSuccess') : $t('users.roles.createSuccess'))
      dialogVisible.value = false
      fetchRoles()
    } catch (error) {
      console.error('Failed to save role:', error)
      ElMessage.error($t('users.roles.saveFailed'))
    }
  })
}

// Lifecycle
onMounted(() => {
  fetchRoles({ page: 1, pageSize: pagination.value.pageSize })
})
</script>

<style scoped>
.user-roles-view {
  padding: 20px;
}

.roles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.roles-header h2 {
  margin: 0;
}
</style>