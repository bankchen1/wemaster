import React, { useEffect, useState } from 'react';
import { List, Avatar, Badge, Tooltip, Button, message } from 'antd';
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './ParticipantList.module.scss';

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'student';
  isAudioOn: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  lastActive: Date;
}

interface ParticipantListProps {
  classId: string;
  isHost: boolean;
  onParticipantAction?: (action: string, participantId: string) => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  classId,
  isHost,
  onParticipantAction,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();
    const interval = setInterval(loadParticipants, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, [classId]);

  const loadParticipants = async () => {
    try {
      const response = await fetch(
        `/api/live-classes/${classId}/participants`
      );
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Failed to load participants:', error);
      message.error('加载参与者列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantAction = async (
    action: string,
    participantId: string
  ) => {
    try {
      await fetch(
        `/api/live-classes/${classId}/participants/${participantId}/action`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }
      );

      onParticipantAction?.(action, participantId);
      message.success('操作成功');
      loadParticipants();
    } catch (error) {
      console.error('Failed to perform action:', error);
      message.error('操作失败');
    }
  };

  const getStatusIcon = (participant: Participant) => {
    const icons = [];

    if (participant.isHandRaised) {
      icons.push(
        <Tooltip title="举手" key="hand">
          <Badge status="warning" />
        </Tooltip>
      );
    }

    if (participant.isAudioOn) {
      icons.push(
        <Tooltip title="已开启音频" key="audio">
          <AudioOutlined style={{ color: '#52c41a' }} />
        </Tooltip>
      );
    } else {
      icons.push(
        <Tooltip title="已关闭音频" key="audio-muted">
          <AudioMutedOutlined style={{ color: '#ff4d4f' }} />
        </Tooltip>
      );
    }

    if (participant.isVideoOn) {
      icons.push(
        <Tooltip title="已开启视频" key="video">
          <VideoCameraOutlined style={{ color: '#52c41a' }} />
        </Tooltip>
      );
    } else {
      icons.push(
        <Tooltip title="已关闭视频" key="video-off">
          <VideoCameraAddOutlined style={{ color: '#ff4d4f' }} />
        </Tooltip>
      );
    }

    return icons;
  };

  const getActionButtons = (participant: Participant) => {
    if (!isHost || participant.role === 'host') return null;

    return (
      <div className={styles.actionButtons}>
        <Button
          size="small"
          onClick={() =>
            handleParticipantAction('toggleAudio', participant.id)
          }
        >
          {participant.isAudioOn ? '静音' : '取消静音'}
        </Button>
        <Button
          size="small"
          onClick={() =>
            handleParticipantAction('toggleVideo', participant.id)
          }
        >
          {participant.isVideoOn ? '关闭视频' : '开启视频'}
        </Button>
        <Button
          size="small"
          danger
          onClick={() =>
            handleParticipantAction('remove', participant.id)
          }
        >
          移除
        </Button>
      </div>
    );
  };

  return (
    <div className={styles.participantList}>
      <h3>参与者 ({participants.length})</h3>
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={participants}
        renderItem={participant => (
          <List.Item
            className={styles.participantItem}
            actions={[getActionButtons(participant)]}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  dot={participant.role === 'host'}
                  color="blue"
                  offset={[-5, 5]}
                >
                  <Avatar icon={<UserOutlined />}>
                    {participant.name[0]}
                  </Avatar>
                </Badge>
              }
              title={
                <div className={styles.participantName}>
                  {participant.name}
                  {participant.role === 'host' && (
                    <span className={styles.hostBadge}>
                      主持人
                    </span>
                  )}
                </div>
              }
              description={
                <div className={styles.statusIcons}>
                  {getStatusIcon(participant)}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};
