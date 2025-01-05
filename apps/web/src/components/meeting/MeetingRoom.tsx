import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MeetingClient } from '@/lib/meeting-client';
import { VideoRoom } from './VideoRoom';
import { ChatRoom } from '../chat/ChatRoom';

interface MeetingRoomProps {
  meetingId: string;
  token: string;
  userName: string;
  userEmail: string;
  isHost: boolean;
  onMeetingEnd?: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({
  meetingId,
  token,
  userName,
  userEmail,
  isHost,
  onMeetingEnd,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const meetingClientRef = useRef<MeetingClient | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeMeeting();

    return () => {
      meetingClientRef.current?.dispose();
    };
  }, []);

  const initializeMeeting = async () => {
    try {
      meetingClientRef.current = new MeetingClient({
        meetingId,
        token,
        userName,
        userEmail,
        onMeetingEnd,
      });

      // 获取会议详情
      const response = await fetch(`/api/meetings/${meetingId}`);
      const meetingData = await response.json();

      // 初始化视频会议
      await meetingClientRef.current.initializeJitsi(
        document.getElementById('jitsi-container')!
      );

      // 初始化聊天
      await meetingClientRef.current.initializeMatrix(
        meetingData.matrixRoomId
      );

      toast({
        title: 'Success',
        description: 'Successfully joined the meeting',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join the meeting',
        variant: 'destructive',
      });
    }
  };

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        await meetingClientRef.current?.stopRecording();
      } else {
        await meetingClientRef.current?.startRecording();
      }
      setIsRecording(!isRecording);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle recording',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 视频会议区域 */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <div id="jitsi-container" className="w-full h-[600px]" />
            {isHost && (
              <div className="mt-4 flex justify-center space-x-4">
                <Button
                  onClick={handleToggleRecording}
                  variant={isRecording ? 'destructive' : 'default'}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* 聊天区域 */}
        <div className="lg:col-span-1">
          <ChatRoom
            roomId={meetingId}
            userId={userName}
            isGroupChat={true}
          />
        </div>
      </div>
    </div>
  );
};
