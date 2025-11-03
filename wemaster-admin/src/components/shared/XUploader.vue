<template>
  <div class="x-uploader">
    <el-upload
      :action="uploadUrl"
      :headers="headers"
      :data="data"
      :multiple="multiple"
      :limit="limit"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :before-upload="beforeUpload"
      :disabled="disabled"
      :accept="accept"
      :list-type="listType"
      :file-list="fileList"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :auto-upload="autoUpload"
      :show-file-list="showFileList"
      :drag="drag"
    >
      <template v-if="drag && listType === 'text'">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          {{ $t('common.upload.dragText') }} <em>{{ $t('common.upload.clickToUpload') }}</em>
        </div>
      </template>
      <template v-else-if="listType === 'picture' || listType === 'picture-card'">
        <el-icon><plus /></el-icon>
      </template>
      <template v-else>
        <el-button :disabled="disabled" type="primary">
          <el-icon><upload /></el-icon>
          {{ $t('common.upload.buttonText') }}
        </el-button>
      </template>
      <template #tip v-if="tip">
        <div class="el-upload__tip">
          {{ tip }}
        </div>
      </template>
    </el-upload>
    
    <!-- 上传进度显示 -->
    <div v-if="showProgress && uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" :status="uploadStatus" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UploadFilled, Plus, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

// Props
const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 1
  },
  accept: {
    type: String,
    default: ''
  },
  listType: {
    type: String,
    default: 'text' // text | picture | picture-card
  },
  drag: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autoUpload: {
    type: Boolean,
    default: true
  },
  showFileList: {
    type: Boolean,
    default: true
  },
  tip: {
    type: String,
    default: ''
  },
  maxSize: {
    type: Number,
    default: 10 // MB
  },
  fileType: {
    type: Array,
    default: () => [] // ['image', 'video', 'document']
  },
  uploadUrl: {
    type: String,
    default: '/api/v1/upload'
  },
  data: {
    type: Object,
    default: () => ({})
  },
  showProgress: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success', 'error', 'progress', 'remove', 'preview'])

// Stores
const userStore = useUserStore()

// State
const fileList = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')

// Computed
const headers = computed(() => {
  return {
    'Authorization': `Bearer ${userStore.token}`,
    'x-tenant-id': userStore.tenantId
  }
})

// Methods
const handleExceed = (files, uploadFiles) => {
  ElMessage.warning(
    props.multiple 
      ? $t('common.upload.maxFiles', { limit: props.limit })
      : $t('common.upload.singleFile')
  )
}

const beforeUpload = (file) => {
  // 文件大小检查
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error($t('common.upload.fileTooLarge', { maxSize: props.maxSize }))
    return false
  }

  // 文件类型检查
  if (props.fileType.length > 0) {
    const fileType = file.type.split('/')[0]
    const isCorrectType = props.fileType.includes(fileType)
    if (!isCorrectType) {
      ElMessage.error($t('common.upload.invalidFileType', { types: props.fileType.join(', ') }))
      return false
    }
  }

  // 重置上传状态
  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = ''

  return true
}

const handleProgress = (event, file, fileList) => {
  uploadProgress.value = parseInt(event.percent)
  emit('progress', { event, file, fileList })
}

const handleSuccess = (response, file, fileList) => {
  uploading.value = false
  uploadProgress.value = 100
  uploadStatus.value = 'success'
  
  // 更新文件列表
  fileList.value = fileList
  
  // 更新modelValue
  if (props.multiple) {
    const urls = fileList.map(f => f.response?.url || f.url).filter(url => url)
    emit('update:modelValue', urls)
  } else {
    const url = fileList[0]?.response?.url || fileList[0]?.url || ''
    emit('update:modelValue', url)
  }
  
  emit('success', { response, file, fileList })
  
  // 显示成功消息
  ElMessage.success($t('common.upload.success'))
}

const handleError = (error, file, fileList) => {
  uploading.value = false
  uploadStatus.value = 'exception'
  
  emit('error', { error, file, fileList })
  
  // 显示错误消息
  ElMessage.error($t('common.upload.failed'))
}

const handleRemove = (file, fileList) => {
  fileList.value = fileList
  emit('remove', { file, fileList })
}

const handlePreview = (file) => {
  emit('preview', file)
}

// Expose methods
defineExpose({
  clearFiles: () => {
    fileList.value = []
    emit('update:modelValue', props.multiple ? [] : '')
  },
  getFileList: () => fileList.value
})
</script>

<style scoped>
.x-uploader {
  width: 100%;
}

.upload-progress {
  margin-top: 10px;
}

.el-upload__tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 7px;
}
</style>