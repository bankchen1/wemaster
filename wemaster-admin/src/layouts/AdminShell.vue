<template>
  <div class="admin-shell">
    <!-- Header -->
    <el-header class="admin-header">
      <div class="header-left">
        <el-button @click="toggleSidebar" class="menu-toggle" icon="Menu" text></el-button>
        <h1 class="logo">WeMaster Admin</h1>
      </div>
      <div class="header-right">
        <!-- Tenant Switcher -->
        <el-select v-model="currentTenant" placeholder="Select Tenant" @change="switchTenant">
          <el-option
            v-for="tenant in tenants"
            :key="tenant.id"
            :label="tenant.name"
            :value="tenant.id"
          />
        </el-select>
        
        <!-- Search -->
        <el-input
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
          clearable
          @clear="clearSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <!-- Alerts -->
        <el-badge :value="alertCount" class="alert-badge">
          <el-button icon="Bell" text></el-button>
        </el-badge>
        
        <!-- User Menu -->
        <el-dropdown @command="handleUserCommand">
          <span class="user-menu">
            <el-avatar :src="userAvatar" size="small" />
            <span class="username">{{ username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">Profile</el-dropdown-item>
              <el-dropdown-item command="settings">Settings</el-dropdown-item>
              <el-dropdown-item command="logout" divided>Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <!-- Sidebar -->
      <el-aside :width="sidebarWidth" class="admin-sidebar">
        <el-menu
          :default-active="activeMenu"
          :collapse="isSidebarCollapsed"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>Dashboard</template>
          </el-menu-item>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>Users</template>
          </el-menu-item>
          <el-menu-item index="/tutors">
            <el-icon><UserFilled /></el-icon>
            <template #title>Tutors</template>
          </el-menu-item>
          <el-menu-item index="/students">
            <el-icon><User /></el-icon>
            <template #title>Students</template>
          </el-menu-item>
          <el-menu-item index="/courses">
            <el-icon><Document /></el-icon>
            <template #title>Courses</template>
          </el-menu-item>
          <el-menu-item index="/sessions">
            <el-icon><Calendar /></el-icon>
            <template #title>Sessions</template>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <template #title>Orders</template>
          </el-menu-item>
          <el-menu-item index="/payments">
            <el-icon><CreditCard /></el-icon>
            <template #title>Payments</template>
          </el-menu-item>
          <el-menu-item index="/subscriptions">
            <el-icon><Collection /></el-icon>
            <template #title>Subscriptions</template>
          </el-menu-item>
          <el-menu-item index="/wallets">
            <el-icon><Wallet /></el-icon>
            <template #title>Wallets</template>
          </el-menu-item>
          <el-menu-item index="/earnings">
            <el-icon><TrendCharts /></el-icon>
            <template #title>Earnings</template>
          </el-menu-item>
          <el-menu-item index="/messages">
            <el-icon><ChatLineSquare /></el-icon>
            <template #title>Messages</template>
          </el-menu-item>
          <el-menu-item index="/content">
            <el-icon><DocumentCopy /></el-icon>
            <template #title>Content</template>
          </el-menu-item>
          <el-menu-item index="/marketing">
            <el-icon><Promotion /></el-icon>
            <template #title>Marketing</template>
          </el-menu-item>
          <el-menu-item index="/analytics">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>Analytics</template>
          </el-menu-item>
          <el-menu-item index="/moderation">
            <el-icon><Warning /></el-icon>
            <template #title>Moderation</template>
          </el-menu-item>
          <el-menu-item index="/tenants">
            <el-icon><OfficeBuilding /></el-icon>
            <template #title>Tenants</template>
          </el-menu-item>
          <el-menu-item index="/integrations">
            <el-icon><Connection /></el-icon>
            <template #title>Integrations</template>
          </el-menu-item>
          <el-menu-item index="/ops">
            <el-icon><Setting /></el-icon>
            <template #title>Ops</template>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Tools /></el-icon>
            <template #title>Settings</template>
          </el-menu-item>
          <el-menu-item index="/audit">
            <el-icon><Tickets /></el-icon>
            <template #title>Audit</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- Main Content -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>

    <!-- Footer -->
    <el-footer class="admin-footer">
      <div class="footer-content">
        <span>Environment: {{ environment }}</span>
        <span>Version: {{ version }}</span>
        <span>API Latency: {{ apiLatency }}ms</span>
        <span>Cache Hit: {{ cacheHitRate }}%</span>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { useUserStore } from '@/store/user';
import {
  Odometer,
  User,
  UserFilled,
  Document,
  Calendar,
  List,
  CreditCard,
  Collection,
  Wallet,
  TrendCharts,
  ChatLineSquare,
  DocumentCopy,
  Promotion,
  DataAnalysis,
  Warning,
  OfficeBuilding,
  Connection,
  Setting,
  Tools,
  Tickets,
  Menu,
  Search,
  Bell
} from '@element-plus/icons-vue';

// Stores
const appStore = useAppStore();
const userStore = useUserStore();

// Router
const route = useRoute();
const router = useRouter();

// State
const currentTenant = ref('');
const searchQuery = ref('');
const alertCount = ref(3);
const tenants = ref([
  { id: 'wemaster', name: 'WeMaster' },
  { id: 'tenant1', name: 'Tenant 1' },
  { id: 'tenant2', name: 'Tenant 2' }
]);

// Computed
const isSidebarCollapsed = computed(() => appStore.sidebarCollapsed);
const sidebarWidth = computed(() => isSidebarCollapsed.value ? '64px' : '200px');
const activeMenu = computed(() => route.path);
const username = computed(() => userStore.currentUser?.name || 'Admin User');
const userAvatar = computed(() => userStore.currentUser?.avatar || '');

// Environment info
const environment = import.meta.env.MODE || 'development';
const version = '1.0.0';
const apiLatency = ref(42);
const cacheHitRate = ref(92);

// Methods
const toggleSidebar = () => {
  appStore.toggleSidebar();
};

const switchTenant = (tenantId) => {
  appStore.setTenantId(tenantId);
  // In a real implementation, you would reload the page or refresh data
  console.log(`Switched to tenant: ${tenantId}`);
};

const clearSearch = () => {
  searchQuery.value = '';
};

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'logout':
      userStore.logout();
      router.push('/login');
      break;
  }
};

const handleMenuSelect = (index) => {
  router.push(index);
};

// Lifecycle
onMounted(() => {
  // Initialize tenant
  currentTenant.value = appStore.tenantId || 'wemaster';
});
</script>

<style scoped>
.admin-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: var(--bg-header);
  border-bottom: 1px solid var(--border-base);
  height: var(--header-height);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  margin: 0 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 200px;
}

.alert-badge {
  margin-right: 10px;
}

.user-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

.admin-sidebar {
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-base);
  transition: width 0.3s ease;
}

.sidebar-menu {
  border: none;
}

.admin-main {
  background-color: var(--bg-body);
  padding: 20px;
  overflow: auto;
}

.admin-footer {
  background-color: var(--bg-footer);
  border-top: 1px solid var(--border-base);
  height: var(--footer-height);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>