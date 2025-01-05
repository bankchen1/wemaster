import { matrixConfig } from '../config/matrix.config';
import { jitsiConfig } from '../config/jitsi.config';

export class MeetingClient {
  private jitsiApi: any;
  private matrixClient: any;
  private meetingId: string;
  private token: string;

  constructor(private options: {
    meetingId: string;
    token: string;
    userName: string;
    userEmail: string;
    onMeetingEnd?: () => void;
  }) {
    this.meetingId = options.meetingId;
    this.token = options.token;
  }

  async initializeJitsi(container: HTMLElement) {
    try {
      const domain = jitsiConfig.domain;
      const options = {
        roomName: `wepal-${this.meetingId}`,
        width: '100%',
        height: '100%',
        parentNode: container,
        jwt: this.token,
        userInfo: {
          displayName: this.options.userName,
          email: this.options.userEmail,
        },
        configOverwrite: {
          ...jitsiConfig.meetingDefaults,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'profile',
            'recording',
            'livestreaming',
            'etherpad',
            'sharedvideo',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'chat',
            'whiteboard',
          ],
        },
        onload: () => {
          console.log('Jitsi Meet loaded successfully');
        },
      };

      // @ts-ignore
      this.jitsiApi = new window.JitsiMeetExternalAPI(domain, options);

      // 添加事件监听
      this.jitsiApi.addEventListeners({
        readyToClose: this.handleMeetingEnd.bind(this),
        participantLeft: this.handleParticipantLeft.bind(this),
        participantJoined: this.handleParticipantJoined.bind(this),
        recordingStatusChanged: this.handleRecordingStatusChange.bind(this),
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Jitsi Meet:', error);
      throw error;
    }
  }

  async initializeMatrix(roomId: string) {
    try {
      const sdk = require('matrix-js-sdk');
      this.matrixClient = sdk.createClient({
        baseUrl: matrixConfig.homeserverUrl,
        accessToken: this.token,
        userId: this.options.userName,
      });

      await this.matrixClient.startClient({ initialSyncLimit: 10 });
      await this.matrixClient.joinRoom(roomId);

      // 监听消息
      this.matrixClient.on('Room.timeline', (event: any) => {
        if (event.getType() === 'm.room.message') {
          this.handleMatrixMessage(event);
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Matrix client:', error);
      throw error;
    }
  }

  // 发送消息
  async sendMessage(content: string, type: 'text' | 'image' | 'file' = 'text') {
    try {
      const messageContent = {
        body: content,
        msgtype: `m.${type}`,
      };

      await this.matrixClient.sendMessage(
        this.meetingId,
        messageContent
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // 开始录制
  async startRecording() {
    try {
      this.jitsiApi.executeCommand('startRecording', {
        mode: 'file',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  // 停止录制
  async stopRecording() {
    try {
      this.jitsiApi.executeCommand('stopRecording');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  // 处理会议结束
  private handleMeetingEnd() {
    this.jitsiApi?.dispose();
    this.matrixClient?.stopClient();
    this.options.onMeetingEnd?.();
  }

  // 处理参与者离开
  private handleParticipantLeft(participant: any) {
    console.log('Participant left:', participant);
  }

  // 处理参与者加入
  private handleParticipantJoined(participant: any) {
    console.log('Participant joined:', participant);
  }

  // 处理录制状态变化
  private handleRecordingStatusChange(status: any) {
    console.log('Recording status changed:', status);
  }

  // 处理 Matrix 消息
  private handleMatrixMessage(event: any) {
    console.log('New message:', event.getContent());
  }

  // 清理资源
  dispose() {
    this.handleMeetingEnd();
  }
}
