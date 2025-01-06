import type { User } from '@/types/classroom';

export interface JitsiConfig {
  roomName: string;
  displayName: string;
  subject?: string;
  width?: string | number;
  height?: string | number;
  audioMuted?: boolean;
  videoMuted?: boolean;
}

class JitsiService {
  private static instance: JitsiService;
  private domain = 'meet.jit.si';

  private constructor() {}

  static getInstance(): JitsiService {
    if (!JitsiService.instance) {
      JitsiService.instance = new JitsiService();
    }
    return JitsiService.instance;
  }

  generateRoomName(prefix: string = 'wepal'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}_${timestamp}_${random}`;
  }

  getDefaultConfig(user: User, roomName: string): JitsiConfig {
    return {
      roomName,
      displayName: user.name,
      subject: 'Wepal Classroom',
      width: '100%',
      height: '100%',
      audioMuted: true,
      videoMuted: true
    };
  }

  getToolbarButtons(isTeacher: boolean): string[] {
    const buttons = [
      'microphone',
      'camera',
      'desktop',
      'participant-list',
      'chat',
      'raisehand',
      'tileview',
      'settings'
    ];

    if (isTeacher) {
      buttons.push(
        'security',
        'recording',
        'livestreaming',
        'sharedvideo',
        'etherpad',
        'select-background'
      );
    }

    return buttons;
  }

  getInterfaceConfig(isTeacher: boolean) {
    return {
      TOOLBAR_BUTTONS: this.getToolbarButtons(isTeacher),
      SETTINGS_SECTIONS: ['devices', 'language', 'moderator'],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_BACKGROUND: '#1a1a1a',
      TOOLBAR_ALWAYS_VISIBLE: true,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
      DISABLE_FOCUS_INDICATOR: true,
      DISABLE_VIDEO_BACKGROUND: false,
      ENABLE_RECORDING: isTeacher,
      ENABLE_LIVESTREAMING: isTeacher,
      MOBILE_APP_PROMO: false,
      SHOW_CHROME_EXTENSION_BANNER: false,
      ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 5000,
      TILE_VIEW_MAX_COLUMNS: 5
    };
  }

  getConfigOverwrite(isTeacher: boolean) {
    return {
      startWithAudioMuted: true,
      startWithVideoMuted: true,
      enableWelcomePage: false,
      enableClosePage: false,
      disableDeepLinking: true,
      prejoinPageEnabled: false,
      disableInviteFunctions: !isTeacher,
      enableLobby: isTeacher,
      enableClosePage: false,
      enableNoisyMicDetection: true,
      enableNoAudioDetection: true,
      enableTalkWhileMuted: true,
      disableRemoteMute: !isTeacher,
      disablePolls: !isTeacher,
      disableReactions: false,
      enableAutomaticUrlCopy: false,
      toolbarConfig: {
        alwaysVisible: true,
        initialTimeout: 4000,
        timeout: 4000
      },
      notifications: [
        'connection.CONNFAIL',
        'dialog.micNotSendingData',
        'dialog.cameraNotSendingData',
        'dialog.kickTitle',
        'dialog.locketTitle',
        'dialog.maxUsersLimitReached',
        'dialog.micDisableTitle',
        'dialog.cameraDisableTitle',
        'dialog.recording',
        'notify.chatMessages',
        'notify.disconnected',
        'notify.moderator',
        'notify.mutedTitle',
        'notify.raisedHand',
        'notify.startRecording',
        'notify.stopRecording'
      ]
    };
  }
}

export const jitsiService = JitsiService.getInstance();
