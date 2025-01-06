<template>
  <div class="classroom-container">
    <!-- 顶部工具栏 -->
    <div class="classroom-header">
      <div class="left">
        <h1>{{ classroom?.name }}</h1>
        <el-tag>{{ classroom?.status }}</el-tag>
      </div>
      <div class="right">
        <el-button-group>
          <el-button :type="audioEnabled ? 'primary' : 'danger'" @click="toggleAudio">
            <i-ep-microphone v-if="audioEnabled" />
            <i-ep-microphone-slash v-else />
          </el-button>
          <el-button :type="videoEnabled ? 'primary' : 'danger'" @click="toggleVideo">
            <i-ep-video-camera v-if="videoEnabled" />
            <i-ep-video-camera-slash v-else />
          </el-button>
          <el-button type="primary" @click="toggleScreenShare">
            <i-ep-monitor />
          </el-button>
          <el-button type="primary" @click="toggleWhiteboard">
            <i-ep-edit />
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="classroom-main">
      <!-- 视频区域 -->
      <div class="video-container" :class="{ 'with-whiteboard': showWhiteboard }">
        <jitsi-meet-component
          :room-name="classroom?.id || ''"
          :display-name="currentUser?.name || ''"
          @ready="handleJitsiReady"
          @error="handleJitsiError"
          ref="jitsiRef"
        />
      </div>

      <!-- 白板区域 -->
      <div v-if="showWhiteboard" class="whiteboard-container">
        <whiteboard-component />
      </div>
    </div>

    <!-- 侧边栏 -->
    <div class="classroom-sidebar">
      <!-- 参与者列表 -->
      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="参与者" name="participants">
          <participant-list :participants="participants" />
        </el-collapse-item>
        
        <!-- 聊天区域 -->
        <el-collapse-item title="聊天" name="chat">
          <chat-component :messages="chatMessages" @send="sendMessage" />
        </el-collapse-item>

        <!-- 投票区域 -->
        <el-collapse-item v-if="canModerate" title="投票" name="polls">
          <poll-component :polls="activePolls" @create="createPoll" />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useClassroomStore } from '@/stores/classroom';
import type { ChatMessage, Poll } from '@/types/classroom';

// 组件引入
import WhiteboardComponent from '@/components/WhiteboardComponent.vue';
import ParticipantList from '@/components/ParticipantList.vue';
import ChatComponent from '@/components/ChatComponent.vue';
import PollComponent from '@/components/PollComponent.vue';
import JitsiMeetComponent from '@/components/JitsiMeetComponent.vue';

const route = useRoute();
const store = useClassroomStore();

// 状态
const audioEnabled = ref(false);
const videoEnabled = ref(false);
const showWhiteboard = ref(false);
const activeCollapse = ref(['participants', 'chat']);

// 从store获取数据
const { 
  currentClassroom: classroom,
  participants,
  chatMessages,
  activePolls,
  canModerate,
  currentUser
} = store;

// 方法
const toggleAudio = () => {
  audioEnabled.value = !audioEnabled.value;
  store.toggleAudio(audioEnabled.value);
};

const toggleVideo = () => {
  videoEnabled.value = !videoEnabled.value;
  store.toggleVideo(videoEnabled.value);
};

const toggleScreenShare = () => {
  if (store.isScreenSharing) {
    store.stopScreenShare();
  } else {
    store.startScreenShare();
  }
};

const toggleWhiteboard = () => {
  showWhiteboard.value = !showWhiteboard.value;
};

const sendMessage = (content: string) => {
  store.sendChatMessage(content);
};

const createPoll = (question: string, options: string[]) => {
  store.createPoll(question, options);
};

const handleJitsiReady = () => {
  console.log('Jitsi Meet ready');
};

const handleJitsiError = (error: any) => {
  console.error('Jitsi Meet error:', error);
};

// 生命周期
onMounted(async () => {
  const classroomId = route.params.id as string;
  await store.joinClassroom(classroomId, {
    id: 'temp-user-id',
    name: '测试用户',
    role: 'student'
  });
});

onUnmounted(() => {
  store.leaveClassroom();
});
</script>

<style scoped lang="scss">
.classroom-container {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  height: 100vh;
  padding: 1rem;
  background: #f5f7fa;

  .classroom-header {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

    .left {
      display: flex;
      align-items: center;
      gap: 1rem;

      h1 {
        margin: 0;
        font-size: 1.5rem;
      }
    }
  }

  .classroom-main {
    display: flex;
    gap: 1rem;
    overflow: hidden;
  }

  .video-container {
    flex: 1;
    background: #000;
    border-radius: 8px;
    overflow: hidden;

    &.with-whiteboard {
      flex: 0.6;
    }
  }

  .whiteboard-container {
    flex: 0.4;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  .classroom-sidebar {
    width: 300px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    overflow-y: auto;
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;

    .video-item {
      aspect-ratio: 16/9;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
      position: relative;

      .participant-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0.5rem;
        background: rgba(0,0,0,0.5);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}
</style>
