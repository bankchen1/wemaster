<template>
  <div class="whiteboard-container">
    <div class="whiteboard-toolbar">
      <el-button-group>
        <el-button 
          v-for="tool in tools" 
          :key="tool.name"
          :type="currentTool === tool.name ? 'primary' : 'default'"
          @click="selectTool(tool.name)"
          :title="tool.label"
        >
          <el-icon>
            <component :is="tool.icon" />
          </el-icon>
        </el-button>
      </el-button-group>

      <el-divider direction="vertical" />

      <!-- 颜色选择器 -->
      <el-color-picker
        v-model="currentColor"
        size="small"
        :predefine="predefineColors"
      />

      <!-- 线条粗细 -->
      <el-slider
        v-model="strokeWidth"
        :min="1"
        :max="20"
        :step="1"
        style="width: 100px; margin: 0 16px;"
      />

      <!-- 操作按钮 -->
      <el-button-group>
        <el-button @click="undo" :disabled="!canUndo">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-button @click="redo" :disabled="!canRedo">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button @click="clearCanvas">
          <el-icon><Delete /></el-icon>
        </el-button>
      </el-button-group>

      <!-- 页面控制 -->
      <div class="page-control">
        <el-button @click="prevPage" :disabled="currentPage === 1">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <el-button @click="nextPage" :disabled="currentPage === totalPages">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button @click="addPage">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="canvas-container" ref="canvasContainer">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { fabric } from 'fabric';
import { useClassroomStore } from '@/stores/classroom';
import { storeToRefs } from 'pinia';

// 工具定义
const tools = [
  { name: 'select', label: '选择', icon: 'Pointer' },
  { name: 'pencil', label: '铅笔', icon: 'Edit' },
  { name: 'line', label: '直线', icon: 'Minus' },
  { name: 'rectangle', label: '矩形', icon: 'Rectangle' },
  { name: 'circle', label: '圆形', icon: 'CirclePlus' },
  { name: 'text', label: '文本', icon: 'TextWidth' },
  { name: 'eraser', label: '橡皮擦', icon: 'Delete' }
];

// 状态
const currentTool = ref('pencil');
const currentColor = ref('#000000');
const strokeWidth = ref(2);
const currentPage = ref(1);
const totalPages = ref(1);
const canUndo = ref(false);
const canRedo = ref(false);

// 预定义颜色
const predefineColors = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF'
];

// DOM引用
const canvasContainer = ref<HTMLElement>();
const canvas = ref<HTMLCanvasElement>();
let fabricCanvas: fabric.Canvas;

// Store
const store = useClassroomStore();
const { currentWhiteboard } = storeToRefs(store);

// 初始化Fabric.js画布
const initCanvas = () => {
  if (!canvas.value) return;

  fabricCanvas = new fabric.Canvas(canvas.value, {
    isDrawingMode: true,
    width: canvasContainer.value?.clientWidth,
    height: canvasContainer.value?.clientHeight,
    backgroundColor: '#ffffff'
  });

  // 设置画笔样式
  fabricCanvas.freeDrawingBrush.color = currentColor.value;
  fabricCanvas.freeDrawingBrush.width = strokeWidth.value;

  // 监听画布变化
  fabricCanvas.on('path:created', () => {
    canUndo.value = true;
    emitCanvasChange();
  });
};

// 工具选择
const selectTool = (toolName: string) => {
  currentTool.value = toolName;
  if (!fabricCanvas) return;

  switch (toolName) {
    case 'select':
      fabricCanvas.isDrawingMode = false;
      break;
    case 'pencil':
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
      break;
    case 'eraser':
      fabricCanvas.isDrawingMode = true;
      fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(fabricCanvas);
      break;
    default:
      fabricCanvas.isDrawingMode = false;
      break;
  }
};

// 画布操作
const undo = () => {
  if (!fabricCanvas) return;
  // TODO: 实现撤销功能
};

const redo = () => {
  if (!fabricCanvas) return;
  // TODO: 实现重做功能
};

const clearCanvas = () => {
  if (!fabricCanvas) return;
  fabricCanvas.clear();
  fabricCanvas.backgroundColor = '#ffffff';
  emitCanvasChange();
};

// 页面控制
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadPage(currentPage.value);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadPage(currentPage.value);
  }
};

const addPage = () => {
  totalPages.value++;
  currentPage.value = totalPages.value;
  clearCanvas();
};

const loadPage = (pageNumber: number) => {
  // TODO: 从store加载页面数据
};

// 画布变化同步
const emitCanvasChange = () => {
  if (!fabricCanvas) return;
  const json = fabricCanvas.toJSON();
  // TODO: 通过WebSocket发送画布数据
};

// 监听属性变化
watch(currentColor, (newColor) => {
  if (!fabricCanvas) return;
  fabricCanvas.freeDrawingBrush.color = newColor;
});

watch(strokeWidth, (newWidth) => {
  if (!fabricCanvas) return;
  fabricCanvas.freeDrawingBrush.width = newWidth;
});

// 生命周期钩子
onMounted(() => {
  initCanvas();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  fabricCanvas?.dispose();
});

const handleResize = () => {
  if (!fabricCanvas || !canvasContainer.value) return;
  fabricCanvas.setDimensions({
    width: canvasContainer.value.clientWidth,
    height: canvasContainer.value.clientHeight
  });
};
</script>

<style scoped lang="scss">
.whiteboard-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;

  .whiteboard-toolbar {
    padding: 8px;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 8px;

    .page-control {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }
  }

  .canvas-container {
    flex: 1;
    overflow: hidden;
    position: relative;

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
