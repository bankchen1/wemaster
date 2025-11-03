<template>
  <div class="x-table">
    <div class="x-table-header">
      <!-- Search and Filters -->
      <div class="x-table-filters">
        <slot name="filters"></slot>
      </div>
      
      <!-- Actions -->
      <div class="x-table-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <!-- Table -->
    <el-table
      :data="tableData"
      :loading="loading"
      :stripe="stripe"
      :border="border"
      :height="height"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <slot></slot>
    </el-table>
    
    <!-- Pagination -->
    <div class="x-table-pagination" v-if="pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="pagination.pageSizes || [10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  stripe: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  pagination: {
    type: Object,
    default: null
  },
  selectedItems: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits([
  'update:selectedItems',
  'sort-change',
  'page-change',
  'selection-change'
]);

// Data
const tableData = ref(props.data);

// Watchers
watch(() => props.data, (newData) => {
  tableData.value = newData;
});

// Methods
const handleSelectionChange = (selection) => {
  emit('update:selectedItems', selection);
  emit('selection-change', selection);
};

const handleSortChange = (sort) => {
  emit('sort-change', sort);
};

const handleSizeChange = (pageSize) => {
  emit('page-change', { page: props.pagination.currentPage, pageSize });
};

const handleCurrentChange = (currentPage) => {
  emit('page-change', { page: currentPage, pageSize: props.pagination.pageSize });
};
</script>

<style scoped>
.x-table {
  background-color: var(--bg-container);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-base);
  overflow: hidden;
}

.x-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-base);
}

.x-table-filters {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.x-table-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.x-table-pagination {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-base);
  background-color: var(--bg-container);
}
</style>