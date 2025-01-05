import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface VideoRoomProps {
  roomId: string;
  userName: string;
  userEmail: string;
  isHost: boolean;
  onMeetingEnd?: () => void;
}

export const VideoRoom: React.FC<VideoRoomProps> = ({
  roomId,
  userName,
  userEmail,
  isHost,
  onMeetingEnd,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // 动态加载 Jitsi Meet API 脚本
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = initJitsiMeet;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initJitsiMeet = () => {
    try {
      const domain = 'meet.jit.si';
      const options = {
        roomName: `wepal-${roomId}`,
        width: '100%',
        height: '600px',
        parentNode: document.getElementById('jitsi-container'),
        userInfo: {
          displayName: userName,
          email: userEmail,
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
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
            'feedback',
            'stats',
            'shortcuts',
            'tileview',
            'chat',
            'whiteboard',
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          MOBILE_APP_PROMO: false,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      // 事件监听
      api.addEventListeners({
        readyToClose: handleMeetingEnd,
        participantLeft: handleParticipantLeft,
        participantJoined: handleParticipantJoined,
        recordingStatusChanged: handleRecordingStatusChange,
        chatUpdated: handleChatMessage,
      });

      // 如果是主持人，设置额外权限
      if (isHost) {
        api.executeCommand('toggleLobby', true);
        api.executeCommand('overwriteConfig', {
          disableRemoteMute: false,
          remoteVideoMenu: {
            disableKick: false,
          },
        });
      }

      return () => api.dispose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize video meeting',
        variant: 'destructive',
      });
    }
  };

  const handleMeetingEnd = () => {
    onMeetingEnd?.();
    router.push('/dashboard');
  };

  const handleParticipantLeft = ({ id, displayName }: any) => {
    toast({
      title: 'Participant Left',
      description: `${displayName} has left the meeting`,
    });
  };

  const handleParticipantJoined = ({ id, displayName }: any) => {
    toast({
      title: 'Participant Joined',
      description: `${displayName} has joined the meeting`,
    });
  };

  const handleRecordingStatusChange = ({ on, mode }: any) => {
    toast({
      title: 'Recording Status',
      description: `Recording ${on ? 'started' : 'stopped'}`,
    });
  };

  const handleChatMessage = ({ message }: any) => {
    // 处理聊天消息，可以集成到自己的聊天系统
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-4">
        <div id="jitsi-container" className="w-full" />
        <div className="mt-4 flex justify-center">
          <Button
            variant="destructive"
            onClick={handleMeetingEnd}
          >
            End Meeting
          </Button>
        </div>
      </Card>
    </div>
  );
};
