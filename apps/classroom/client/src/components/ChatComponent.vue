<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="messages" ref="messagesRef">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="{ 'message-self': message.sender.id === currentUser?.id }"
      >
        <el-avatar
          :size="32"
          :src="message.sender.avatar"
        >{{ message.sender.name[0] }}</el-avatar>
        
        <div class="message-content">
          <div class="message-header">
            <span class="sender-name">{{ message.sender.name }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          
          <div class="message-body">
            <template v-if="message.type === 'text'">
              {{ message.content }}
            </template>
            <template v-else-if="message.type === 'image'">
              <el-image
                :src="message.content"
                :preview-src-list="[message.content]"
                fit="cover"
                class="message-image"
              />
            </template>
            <template v-else-if="message.type === 'file'">
              <div class="file-message">
                <el-icon><Document /></el-icon>
                <span>{{ message.content }}</span>
                <el-button size="small" @click="downloadFile(message)">
                  下载
                </el-button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="toolbar">
        <el-upload
          action=""
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          @change="handleImageUpload"
        >
          <el-button type="text">
            <el-icon><Picture /></el-icon>
          </el-button>
        </el-upload>
        
        <el-upload
          action=""
          :auto-upload="false"
          :show-file-list="false"
          @change="handleFileUpload"
        >
          <el-button type="text">
            <el-icon><Paperclip /></el-icon>
          </el-button>
        </el-upload>

        <el-button type="text" @click="toggleEmoji">
          <el-icon><SmileFilled /></el-icon>
        </el-button>
      </div>

      <div class="message-input">
        <el-input
          v-model="messageText"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keydown.enter.prevent="sendMessage"
        />
        <el-button type="primary" @click="sendMessage">
          发送
        </el-button>
      </div>

      <!-- Emoji选择器 -->
      <div v-if="showEmoji" class="emoji-picker">
        <div
          v-for="emoji in emojis"
          :key="emoji"
          class="emoji"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useClassroomStore } from '@/stores/classroom';
import type { ChatMessage } from '@/types/classroom';
import { formatTime } from '@/utils/time';

const props = defineProps<{
  messages: ChatMessage[];
}>();

const emit = defineEmits<{
  (e: 'send', message: string): void;
}>();

const store = useClassroomStore();
const { currentUser } = store;

// 状态
const messageText = ref('');
const showEmoji = ref(false);
const messagesRef = ref<HTMLElement>();

// Emoji列表
const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍'];

// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim()) return;
  
  emit('send', messageText.value);
  messageText.value = '';
  showEmoji.value = false;
};

// 处理图片上传
const handleImageUpload = async (file: File) => {
  // TODO: 实现图片上传
};

// 处理文件上传
const handleFileUpload = async (file: File) => {
  // TODO: 实现文件上传
};

// 下载文件
const downloadFile = (message: ChatMessage) => {
  // TODO: 实现文件下载
};

// Emoji相关
const toggleEmoji = () => {
  showEmoji.value = !showEmoji.value;
};

const insertEmoji = (emoji: string) => {
  messageText.value += emoji;
};

// 自动滚动到底部
const scrollToBottom = () => {
  if (!messagesRef.value) return;
  
  nextTick(() => {
    messagesRef.value!.scrollTop = messagesRef.value!.scrollHeight;
  });
};

// 监听消息变化
watch(() => props.messages.length, () => {
  scrollToBottom();
});

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .message {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;

      &.message-self {
        flex-direction: row-reverse;

        .message-content {
          align-items: flex-end;

          .message-body {
            background: #e6f7ff;
          }
        }
      }

      .message-content {
        display: flex;
        flex-direction: column;
        max-width: 70%;

        .message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          .sender-name {
            font-weight: 500;
            font-size: 14px;
          }

          .message-time {
            color: #999;
            font-size: 12px;
          }
        }

        .message-body {
          padding: 8px 12px;
          background: #f5f5f5;
          border-radius: 4px;
          word-break: break-word;

          .message-image {
            max-width: 200px;
            border-radius: 4px;
          }

          .file-message {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      }
    }
  }

  .input-area {
    border-top: 1px solid #eee;
    padding: 16px;
    position: relative;

    .toolbar {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .message-input {
      display: flex;
      gap: 8px;

      .el-textarea {
        flex: 1;
      }
    }

    .emoji-picker {
      position: absolute;
      bottom: 100%;
      left: 16px;
      background: white;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 8px;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 4px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);

      .emoji {
        cursor: pointer;
        padding: 4px;
        text-align: center;
        border-radius: 4px;

        &:hover {
          background: #f5f5f5;
        }
      }
    }
  }
}
</style>
