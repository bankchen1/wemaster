<template>
  <div class="settings-dictionaries">
    <div class="header">
      <h2>{{ $t('settings.dictionaries.title') }}</h2>
      <el-button type="primary" @click="handleCreateDictionary">
        {{ $t('common.create') }}
      </el-button>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane
        v-for="category in dictionaryCategories"
        :key="category.id"
        :label="category.name"
        :name="category.id"
      >
        <x-table
          :data="dictionaries.filter(dict => dict.category === category.id)"
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <el-table-column prop="id" :label="$t('settings.dictionaries.id')" width="180" />
          <el-table-column prop="key" :label="$t('settings.dictionaries.key')" width="200" />
          <el-table-column prop="value" :label="$t('settings.dictionaries.value')" />
          <el-table-column prop="description" :label="$t('settings.dictionaries.description')" />
          <el-table-column prop="createdAt" :label="$t('settings.dictionaries.createdAt')" width="180" />
          <el-table-column :label="$t('common.actions')" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleEditDictionary(row)">
                {{ $t('common.edit') }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDeleteDictionary(row)">
                {{ $t('common.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </x-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import XTable from '@/components/shared/XTable.vue';

// State
const activeTab = ref('system');
const dictionaries = ref([]);
const loading = ref(false);
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: [10, 20, 50, 100]
});

const dictionaryCategories = ref([
  { id: 'system', name: '系统配置' },
  { id: 'business', name: '业务配置' },
  { id: 'ui', name: '界面配置' }
]);

// Methods
const fetchDictionaries = async (params = {}) => {
  loading.value = true;
  try {
    // In a real implementation, you would call the API
    // const response = await api.getDictionaries(params);
    // dictionaries.value = response.data;
    // pagination.value.total = response.total;
    
    // Mock data for now
    dictionaries.value = Array.from({ length: pagination.value.pageSize }, (_, i) => ({
      id: `DICT${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      key: `config_key_${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      value: `配置值 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
      description: `这是配置项 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1} 的描述`,
      category: ['system', 'business', 'ui'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    pagination.value.total = 1000; // Mock total
  } catch (error) {
    console.error('Failed to fetch dictionaries:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = ({ page, pageSize }) => {
  pagination.value.currentPage = page;
  pagination.value.pageSize = pageSize;
  fetchDictionaries({ page, pageSize });
};

const handleCreateDictionary = () => {
  // Handle create dictionary
  console.log('Create dictionary');
};

const handleEditDictionary = (dictionary) => {
  // Handle edit dictionary
  console.log('Edit dictionary:', dictionary);
};

const handleDeleteDictionary = (dictionary) => {
  // Handle delete dictionary
  console.log('Delete dictionary:', dictionary);
};

// Lifecycle
onMounted(() => {
  fetchDictionaries({ page: 1, pageSize: pagination.value.pageSize });
});
</script>

<style scoped>
.settings-dictionaries {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style>