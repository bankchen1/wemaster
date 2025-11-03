<template>
  <div class="course-detail-view">
    <h2>{{ $t('courses.detail.title') }}</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="$t('courses.detail.tabs.overview')" name="overview">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('courses.detail.fields.id')">
            {{ course.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.fields.name')">
            {{ course.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.fields.tutor')">
            {{ course.tutor }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.fields.status')">
            <el-tag :type="course.status === 'published' ? 'success' : 'warning'">
              {{ course.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.fields.rating')">
            {{ course.rating }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.fields.sales')">
            {{ course.sales }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('courses.detail.tabs.content')" name="content">
        <el-button type="primary" @click="handleEditContent">
          {{ $t('courses.detail.actions.editContent') }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane :label="$t('courses.detail.tabs.pricing')" name="pricing">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('courses.detail.pricing.basePrice')">
            ¥{{ pricing.basePrice }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.pricing.discountPrice')">
            ¥{{ pricing.discountPrice }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.pricing.taxRate')">
            {{ pricing.taxRate }}%
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('courses.detail.tabs.seo')" name="seo">
        <el-descriptions :column="1" border>
          <el-descriptions-item :label="$t('courses.detail.seo.title')">
            {{ seo.title }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.seo.description')">
            {{ seo.description }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('courses.detail.seo.keywords')">
            {{ seo.keywords }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane :label="$t('courses.detail.tabs.media')" name="media">
        <el-button type="primary" @click="handleManageMedia">
          {{ $t('courses.detail.actions.manageMedia') }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane :label="$t('courses.detail.tabs.faq')" name="faq">
        <x-table
          :data="faqs"
          :loading="loading"
        >
          <el-table-column prop="question" :label="$t('courses.detail.faq.question')" />
          <el-table-column prop="answer" :label="$t('courses.detail.faq.answer')" />
        </x-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import XTable from '@/components/shared/XTable.vue';

const route = useRoute();

// State
const activeTab = ref('overview');
const course = ref({
  id: 'COURSE001',
  name: '数学基础课程',
  tutor: '李老师',
  status: 'published',
  rating: 4.8,
  sales: 120
});
const pricing = ref({
  basePrice: 299,
  discountPrice: 199,
  taxRate: 6
});
const seo = ref({
  title: '数学基础课程 - 从零开始学习数学',
  description: '本课程适合零基础学员，系统学习数学基础知识',
  keywords: '数学,基础,零基础,学习'
});
const faqs = ref([]);
const loading = ref(false);

// Methods
const handleEditContent = () => {
  console.log('Edit content for course:', course.value.id);
};

const handleManageMedia = () => {
  console.log('Manage media for course:', course.value.id);
};

const fetchFaqs = async () => {
  // Mock data
  faqs.value = [
    {
      question: '这门课程适合什么水平的学员？',
      answer: '本课程适合零基础学员，从最基础的概念开始讲解。'
    }
  ];
};

// Lifecycle
onMounted(() => {
  fetchFaqs();
});
</script>

<style scoped>
.course-detail-view {
  padding: 20px;
}
</style>