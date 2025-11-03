<template>
  <div class="x-editor">
    <div ref="editorRef" class="editor-container" :class="{ 'disabled': disabled }"></div>
    <div v-if="showToolbar" class="editor-toolbar">
      <el-button-group>
        <el-button @click="execCommand('bold')" :type="isActive('bold') ? 'primary' : ''" size="small">
          <strong>B</strong>
        </el-button>
        <el-button @click="execCommand('italic')" :type="isActive('italic') ? 'primary' : ''" size="small">
          <em>I</em>
        </el-button>
        <el-button @click="execCommand('underline')" :type="isActive('underline') ? 'primary' : ''" size="small">
          <u>U</u>
        </el-button>
        <el-button @click="execCommand('strikeThrough')" :type="isActive('strikeThrough') ? 'primary' : ''" size="small">
          <s>S</s>
        </el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button @click="execCommand('justifyLeft')" size="small">
          <el-icon><align-left /></el-icon>
        </el-button>
        <el-button @click="execCommand('justifyCenter')" size="small">
          <el-icon><align-center /></el-icon>
        </el-button>
        <el-button @click="execCommand('justifyRight')" size="small">
          <el-icon><align-right /></el-icon>
        </el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button @click="execCommand('insertUnorderedList')" size="small">
          <el-icon><list /></el-icon>
        </el-button>
        <el-button @click="execCommand('insertOrderedList')" size="small">
          <el-icon><list-ordered /></el-icon>
        </el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button @click="execCommand('formatBlock', 'H1')" size="small">H1</el-button>
        <el-button @click="execCommand('formatBlock', 'H2')" size="small">H2</el-button>
        <el-button @click="execCommand('formatBlock', 'H3')" size="small">H3</el-button>
        <el-button @click="execCommand('formatBlock', 'P')" size="small">P</el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button @click="execCommand('createLink')" size="small">
          <el-icon><link /></el-icon>
        </el-button>
        <el-button @click="insertImage" size="small">
          <el-icon><picture /></el-icon>
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Picture } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  minHeight: {
    type: [String, Number],
    default: 200
  },
  showToolbar: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// Refs
const editorRef = ref(null)
let editor = null

// Methods
const initEditor = () => {
  if (!editorRef.value) return
  
  // 创建编辑器容器
  editor = document.createElement('div')
  editor.contentEditable = !props.disabled
  editor.className = 'editor-content'
  editor.style.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
  editor.style.outline = 'none'
  editor.style.padding = '10px'
  editor.style.border = '1px solid var(--el-border-color)'
  editor.style.borderRadius = 'var(--el-border-radius-base)'
  editor.style.backgroundColor = 'var(--el-bg-color)'
  
  // 设置占位符
  if (props.placeholder) {
    editor.setAttribute('data-placeholder', props.placeholder)
  }
  
  // 设置初始内容
  editor.innerHTML = props.modelValue || ''
  
  // 添加事件监听
  editor.addEventListener('input', handleInput)
  editor.addEventListener('focus', handleFocus)
  editor.addEventListener('blur', handleBlur)
  editor.addEventListener('keyup', handleKeyup)
  editor.addEventListener('mouseup', handleMouseup)
  
  // 添加到DOM
  editorRef.value.appendChild(editor)
}

const handleInput = () => {
  if (!editor) return
  const content = editor.innerHTML
  emit('update:modelValue', content)
  emit('change', content)
}

const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}

const handleKeyup = () => {
  // 可以在这里添加快捷键处理
}

const handleMouseup = () => {
  // 鼠标选择后更新工具栏状态
}

const execCommand = (command, value = null) => {
  if (!editor || props.disabled) return
  
  editor.focus()
  document.execCommand(command, false, value)
  handleInput()
}

const isActive = (command) => {
  if (!editor) return false
  return document.queryCommandState(command)
}

const insertImage = () => {
  if (props.disabled) return
  
  // 这里可以集成图片上传功能
  const url = prompt($t('common.editor.imagePrompt'))
  if (url) {
    execCommand('insertImage', url)
  }
}

const insertLink = () => {
  if (props.disabled) return
  
  const url = prompt($t('common.editor.linkPrompt'))
  if (url) {
    execCommand('createLink', url)
  }
}

// Watch
watch(() => props.modelValue, (newVal) => {
  if (editor && editor.innerHTML !== newVal) {
    editor.innerHTML = newVal || ''
  }
})

watch(() => props.disabled, (newVal) => {
  if (editor) {
    editor.contentEditable = !newVal
  }
})

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initEditor()
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.removeEventListener('input', handleInput)
    editor.removeEventListener('focus', handleFocus)
    editor.removeEventListener('blur', handleBlur)
    editor.removeEventListener('keyup', handleKeyup)
    editor.removeEventListener('mouseup', handleMouseup)
    editor = null
  }
})

// Expose methods
defineExpose({
  focus: () => {
    if (editor) {
      editor.focus()
    }
  },
  blur: () => {
    if (editor) {
      editor.blur()
    }
  },
  clear: () => {
    if (editor) {
      editor.innerHTML = ''
      handleInput()
    }
  }
})
</script>

<style scoped>
.x-editor {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-fill-color-light);
  border-radius: var(--el-border-radius-base) var(--el-border-radius-base) 0 0;
}

.editor-container {
  position: relative;
}

.editor-container.disabled .editor-content {
  background-color: var(--el-disabled-bg-color);
  cursor: not-allowed;
}

.editor-content {
  position: relative;
}

.editor-content:empty:not(:focus):before {
  content: attr(data-placeholder);
  color: var(--el-text-color-placeholder);
  position: absolute;
  top: 10px;
  left: 10px;
  pointer-events: none;
}
</style>