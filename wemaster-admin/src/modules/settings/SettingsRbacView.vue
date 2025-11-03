<template>
  <div class="settings-rbac">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="角色管理" name="roles">
        <x-table
          :data="roles"
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column prop="id" label="角色ID" width="180" />
          <el-table-column prop="name" label="角色名称" width="200" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditRole(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteRole(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </x-table>
        
        <el-button type="primary" @click="handleCreateRole">
          创建角色
        </el-button>
      </el-tab-pane>
      
      <el-tab-pane label="权限管理" name="permissions">
        <x-table
          :data="permissions"
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column prop="id" label="权限ID" width="180" />
          <el-table-column prop="name" label="权限名称" width="200" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditPermission(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDeletePermission(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </x-table>
        
        <el-button type="primary" @click="handleCreatePermission">
          创建权限
        </el-button>
      </el-tab-pane>
      
      <el-tab-pane label="角色权限分配" name="role-permissions">
        <el-select v-model="selectedRole" placeholder="请选择角色" @change="handleRoleChange">
          <el-option
            v-for="role in roles"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
        
        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :props="treeProps"
          :default-checked-keys="defaultCheckedKeys"
          @check="handlePermissionCheck"
        />
        
        <el-button type="success" @click="handleSaveRolePermissions">
          保存权限分配
        </el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XTable from '@/components/shared/XTable.vue';

// State
const activeTab = ref('roles');
const roles = ref([]);
const permissions = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

const selectedRole = ref('');
const permissionTree = ref([]);
const defaultCheckedKeys = ref([]);
const treeProps = ref({
  children: 'children',
  label: 'name'
});

// Methods
const fetchRoles = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getRoles(params);
    // roles.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    roles.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `ROLE${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `角色 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      description: `这是角色 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1} 的描述`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch roles:', error);
  } finally {
    loading.value = false;
  }
};

const fetchPermissions = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getPermissions(params);
    // permissions.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    permissions.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `PERM${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      name: `权限 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      description: `这是权限 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1} 的描述`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch permissions:', error);
  } finally {
    loading.value = false;
  }
};

const fetchPermissionTree = async () => {
  try {
    // In a real implementation, you would call the API
    // const response = await api.getPermissionTree();
    // permissionTree.value = response.data;
    
    // Mock data for now
    permissionTree.value = [
      {
        id: 'user',
        name: '用户管理',
        children: [
          { id: 'user.view', name: '查看用户' },
          { id: 'user.create', name: '创建用户' },
          { id: 'user.edit', name: '编辑用户' },
          { id: 'user.delete', name: '删除用户' }
        ]
      },
      {
        id: 'course',
        name: '课程管理',
        children: [
          { id: 'course.view', name: '查看课程' },
          { id: 'course.create', name: '创建课程' },
          { id: 'course.edit', name: '编辑课程' },
          { id: 'course.delete', name: '删除课程' }
        ]
      }
    ];
  } catch (error) {
    console.error('Failed to fetch permission tree:', error);
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  if (activeTab.value === 'roles') {
    fetchRoles({ page, pageSize });
  } else if (activeTab.value === 'permissions') {
    fetchPermissions({ page, pageSize });
  }
};

const handleCreateRole = () => {
  // Handle create role
  console.log('Create role');
};

const handleEditRole = (role) => {
  // Handle edit role
  console.log('Edit role:', role);
};

const handleDeleteRole = (role) => {
  // Handle delete role
  console.log('Delete role:', role);
};

const handleCreatePermission = () => {
  // Handle create permission
  console.log('Create permission');
};

const handleEditPermission = (permission) => {
  // Handle edit permission
  console.log('Edit permission:', permission);
};

const handleDeletePermission = (permission) => {
  // Handle delete permission
  console.log('Delete permission:', permission);
};

const handleRoleChange = (roleId) => {
  selectedRole.value = roleId;
  // In a real implementation, you would fetch the permissions for the selected role
  console.log('Role changed:', roleId);
};

const handlePermissionCheck = (data, checkedInfo) => {
  // Handle permission check
  console.log('Permission checked:', data, checkedInfo);
};

const handleSaveRolePermissions = () => {
  // Handle save role permissions
  console.log('Save role permissions');
};

// Lifecycle
onMounted(() => {
  fetchRoles({ page: 1, pageSize: pagination.value.pageSize });
  fetchPermissions({ page: 1, pageSize: pagination.value.pageSize });
  fetchPermissionTree();
});
</script>

<style scoped>
.settings-rbac {
  padding: 20px;
}

.el-tabs {
  background-color: var(--bg-container);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-base);
  padding: 20px;
}
</style>