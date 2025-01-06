<template>
  <div class="jitsi-container" ref="jitsiContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useClassroomStore } from '@/stores/classroom';

const props = defineProps<{
  roomName: string;
  displayName: string;
  onParticipantJoined?: (participant: any) => void;
  onParticipantLeft?: (participant: any) => void;
  onVideoConferenceJoined?: (participant: any) => void;
  onVideoConferenceLeft?: () => void;
}>();

const emit = defineEmits<{
  (e: 'ready'): void;
  (e: 'error', error: any): void;
}>();

const store = useClassroomStore();
const jitsiContainer = ref<HTMLElement>();
let api: any = null;

const initJitsiMeet = async () => {
  try {
    const domain = 'meet.jit.si';
    const options = {
      roomName: props.roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainer.value,
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        enableWelcomePage: false,
        enableClosePage: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        disableInviteFunctions: true
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'participant-list',
          'chat', 'raisehand', 'tileview', 'settings'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#1a1a1a',
        DEFAULT_LOCAL_DISPLAY_NAME: props.displayName,
      },
      userInfo: {
        displayName: props.displayName
      }
    };

    // @ts-ignore
    api = new JitsiMeetExternalAPI(domain, options);

    // 添加事件监听
    api.addEventListeners({
      participantJoined: (participant: any) => {
        props.onParticipantJoined?.(participant);
      },
      participantLeft: (participant: any) => {
        props.onParticipantLeft?.(participant);
      },
      videoConferenceJoined: (participant: any) => {
        props.onVideoConferenceJoined?.(participant);
        emit('ready');
      },
      videoConferenceLeft: () => {
        props.onVideoConferenceLeft?.();
      },
      audioMuteStatusChanged: (muted: boolean) => {
        store.updateAudioStatus(!muted);
      },
      videoMuteStatusChanged: (muted: boolean) => {
        store.updateVideoStatus(!muted);
      },
      screenSharingStatusChanged: (sharing: boolean) => {
        store.updateScreenSharingStatus(sharing);
      },
      participantRoleChanged: (event: any) => {
        store.updateParticipantRole(event.id, event.role);
      },
      chatUpdated: (event: any) => {
        if (event.isOpen !== undefined) {
          store.updateChatVisibility(event.isOpen);
        }
      },
      raiseHandUpdated: (event: any) => {
        store.updateRaiseHandStatus(event.id, event.handRaised);
      }
    });

  } catch (error) {
    console.error('Failed to initialize Jitsi Meet:', error);
    emit('error', error);
  }
};

const executeCommand = (command: string, ...args: any[]) => {
  if (api) {
    api.executeCommand(command, ...args);
  }
};

// 暴露方法给父组件
defineExpose({
  executeCommand,
  toggleAudio: () => executeCommand('toggleAudio'),
  toggleVideo: () => executeCommand('toggleVideo'),
  toggleScreenSharing: () => executeCommand('toggleShareScreen'),
  toggleChat: () => executeCommand('toggleChat'),
  toggleRaiseHand: () => executeCommand('toggleRaiseHand'),
  toggleTileView: () => executeCommand('toggleTileView'),
  hangup: () => executeCommand('hangup')
});

onMounted(() => {
  // 加载Jitsi Meet API脚本
  const script = document.createElement('script');
  script.src = 'https://meet.jit.si/external_api.js';
  script.async = true;
  script.onload = () => {
    initJitsiMeet();
  };
  document.body.appendChild(script);
});

onUnmounted(() => {
  if (api) {
    api.dispose();
  }
});
</script>

<style scoped>
.jitsi-container {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}
</style>
