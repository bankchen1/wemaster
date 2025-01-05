import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Space, message, Layout, Row, Col } from 'antd';
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  VideoPresets,
  createLocalTracks,
  LocalTrack,
  RoomOptions,
} from 'livekit-client';
import { useAuth } from '@/hooks/useAuth';
import { ChatPanel } from './ChatPanel';
import { WhiteBoard } from './WhiteBoard';
import { ParticipantList } from './ParticipantList';
import { ControlPanel } from './ControlPanel';
import { useLiveSession } from '@/hooks/useLiveSession';

const { Header, Content } = Layout;

export const LiveClassroom: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const { session, startSession, endSession, logEvent } = useLiveSession();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (classId) {
      initializeClass();
    }
    return () => {
      leaveClass();
    };
  }, [classId]);

  const initializeClass = async () => {
    try {
      // 获取课堂信息和token
      const response = await fetch(`/api/live-sessions/${classId}`);
      const { token, isHost } = await response.json();

      // 创建并连接到LiveKit房间
      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        videoCodec: 'vp8',
      };

      const room = new Room(roomOptions);
      setRoom(room);

      // 监听房间事件
      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

      // 连接到房间
      await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);
      
      // 创建本地音视频轨道
      const tracks = await createLocalTracks({
        audio: true,
        video: {
          resolution: VideoPresets.h720.resolution,
        },
      });

      // 发布轨道
      await Promise.all(tracks.map(track => room.localParticipant.publishTrack(track)));

      // 更新参与者列表
      setParticipants([room.localParticipant, ...room.participants.values()]);

      // 开始课程
      if (isHost) {
        await startSession(classId);
      }

      message.success('成功加入课堂！');
    } catch (error) {
      message.error('加入课堂失败，请重试');
      console.error('Failed to initialize class:', error);
    }
  };

  const handleParticipantConnected = (participant: RemoteParticipant) => {
    setParticipants(prev => [...prev, participant]);
    logEvent({
      type: 'participant',
      action: 'joined',
      userId: participant.identity,
    });
  };

  const handleParticipantDisconnected = (participant: RemoteParticipant) => {
    setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
    logEvent({
      type: 'participant',
      action: 'left',
      userId: participant.identity,
    });
  };

  const handleTrackSubscribed = (track: LocalTrack) => {
    logEvent({
      type: 'track',
      action: 'subscribed',
      userId: user.id,
      metadata: { trackType: track.kind },
    });
  };

  const handleTrackUnsubscribed = (track: LocalTrack) => {
    logEvent({
      type: 'track',
      action: 'unsubscribed',
      userId: user.id,
      metadata: { trackType: track.kind },
    });
  };

  const toggleMute = async () => {
    if (room?.localParticipant) {
      const audioTrack = room.localParticipant.audioTracks.values().next().value;
      if (audioTrack) {
        await audioTrack.mute(!isMuted);
        setIsMuted(!isMuted);
        logEvent({
          type: 'audio',
          action: isMuted ? 'unmuted' : 'muted',
          userId: user.id,
        });
      }
    }
  };

  const toggleVideo = async () => {
    if (room?.localParticipant) {
      const videoTrack = room.localParticipant.videoTracks.values().next().value;
      if (videoTrack) {
        await videoTrack.mute(!isVideoOff);
        setIsVideoOff(!isVideoOff);
        logEvent({
          type: 'video',
          action: isVideoOff ? 'enabled' : 'disabled',
          userId: user.id,
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!room?.localParticipant) return;

    if (!isScreenSharing) {
      try {
        const screenTrack = await createLocalTracks({
          video: {
            source: 'screen',
          },
        });
        await room.localParticipant.publishTrack(screenTrack[0]);
        setIsScreenSharing(true);
        logEvent({
          type: 'screen_share',
          action: 'started',
          userId: user.id,
        });
      } catch (error) {
        message.error('屏幕共享失败，请重试');
        console.error('Failed to start screen sharing:', error);
      }
    } else {
      const screenTrack = Array.from(room.localParticipant.videoTracks.values())
        .find(track => track.source === 'screen');
      if (screenTrack) {
        await room.localParticipant.unpublishTrack(screenTrack);
        setIsScreenSharing(false);
        logEvent({
          type: 'screen_share',
          action: 'stopped',
          userId: user.id,
        });
      }
    }
  };

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        await fetch(`/api/live-sessions/${classId}/recording/start`, {
          method: 'POST',
        });
        setIsRecording(true);
        logEvent({
          type: 'recording',
          action: 'started',
          userId: user.id,
        });
      } else {
        await fetch(`/api/live-sessions/${classId}/recording/stop`, {
          method: 'POST',
        });
        setIsRecording(false);
        logEvent({
          type: 'recording',
          action: 'stopped',
          userId: user.id,
        });
      }
    } catch (error) {
      message.error('录制操作失败，请重试');
      console.error('Failed to toggle recording:', error);
    }
  };

  const leaveClass = async () => {
    try {
      if (room) {
        if (session?.status === 'active') {
          await endSession(classId);
        }
        await room.disconnect();
        setRoom(null);
      }
      message.success('已退出课堂');
    } catch (error) {
      message.error('退出课堂失败');
      console.error('Failed to leave class:', error);
    }
  };

  return (
    <Layout className="live-classroom">
      <Header className="classroom-header">
        <Row justify="space-between" align="middle">
          <Col>
            <h2 className="class-title">直播课堂</h2>
          </Col>
          <Col>
            <Space>
              <Button
                onClick={toggleMute}
                type={isMuted ? 'primary' : 'default'}
                icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
              >
                {isMuted ? '取消静音' : '静音'}
              </Button>
              <Button
                onClick={toggleVideo}
                type={isVideoOff ? 'primary' : 'default'}
                icon={isVideoOff ? <VideoCameraOutlined /> : <VideoOutlined />}
              >
                {isVideoOff ? '开启视频' : '关闭视频'}
              </Button>
              <Button
                onClick={toggleScreenShare}
                type={isScreenSharing ? 'primary' : 'default'}
                icon={<DesktopOutlined />}
              >
                {isScreenSharing ? '停止共享' : '屏幕共享'}
              </Button>
              {session?.isTutor && (
                <Button
                  onClick={toggleRecording}
                  type={isRecording ? 'primary' : 'default'}
                  icon={<VideoCameraOutlined />}
                >
                  {isRecording ? '停止录制' : '开始录制'}
                </Button>
              )}
              <Button onClick={leaveClass} danger>
                退出课堂
              </Button>
            </Space>
          </Col>
        </Row>
      </Header>

      <Layout>
        <Content className="classroom-content">
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <div className="main-video-container">
                {participants.map(participant => (
                  <ParticipantView
                    key={participant.identity}
                    participant={participant}
                    isLocal={participant === room?.localParticipant}
                  />
                ))}
              </div>
              <WhiteBoard 
                isTutor={session?.isTutor} 
                classId={classId} 
                onEvent={logEvent}
              />
            </Col>
            <Col span={8}>
              <ParticipantList 
                participants={participants}
                localParticipant={room?.localParticipant}
              />
              <ChatPanel 
                classId={classId} 
                userId={user.id} 
                onMessage={message => logEvent({
                  type: 'chat',
                  action: 'message_sent',
                  userId: user.id,
                  metadata: { message },
                })}
              />
            </Col>
          </Row>
        </Content>
        <ControlPanel
          isTutor={session?.isTutor}
          onRaiseHand={() => logEvent({
            type: 'interaction',
            action: 'hand_raised',
            userId: user.id,
          })}
          onSendMessage={message => logEvent({
            type: 'chat',
            action: 'message_sent',
            userId: user.id,
            metadata: { message },
          })}
        />
      </Layout>
    </Layout>
  );
};
