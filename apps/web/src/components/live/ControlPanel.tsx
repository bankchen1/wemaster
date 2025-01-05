import React, { useState } from 'react';
import { Button, Space, Tooltip, Modal, message } from 'antd';
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  DesktopOutlined,
  RaiseHandOutlined,
  SettingOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import styles from './ControlPanel.module.scss';

interface ControlPanelProps {
  isHost: boolean;
  isAudioOn?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
  onAudioToggle?: () => void;
  onVideoToggle?: () => void;
  onScreenShare?: () => void;
  onRaiseHand?: () => void;
  onEndClass?: () => void;
  onSettings?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isHost,
  isAudioOn = true,
  isVideoOn = true,
  isScreenSharing = false,
  isHandRaised = false,
  onAudioToggle,
  onVideoToggle,
  onScreenShare,
  onRaiseHand,
  onEndClass,
  onSettings,
}) => {
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const handleEndClass = () => {
    Modal.confirm({
      title: '确认结束课堂？',
      content: '结束课堂后，所有学生将被移出课堂。',
      okText: '确认结束',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        onEndClass?.();
        message.success('课堂已结束');
      },
    });
  };

  return (
    <div className={styles.controlPanel}>
      <Space size="middle">
        <Tooltip title={isAudioOn ? '关闭麦克风' : '开启麦克风'}>
          <Button
            type={isAudioOn ? 'primary' : 'default'}
            icon={isAudioOn ? <AudioOutlined /> : <AudioMutedOutlined />}
            onClick={onAudioToggle}
          />
        </Tooltip>

        <Tooltip title={isVideoOn ? '关闭摄像头' : '开启摄像头'}>
          <Button
            type={isVideoOn ? 'primary' : 'default'}
            icon={
              isVideoOn ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />
            }
            onClick={onVideoToggle}
          />
        </Tooltip>

        {isHost && (
          <Tooltip title={isScreenSharing ? '停止共享' : '共享屏幕'}>
            <Button
              type={isScreenSharing ? 'primary' : 'default'}
              icon={<DesktopOutlined />}
              onClick={onScreenShare}
            />
          </Tooltip>
        )}

        {!isHost && (
          <Tooltip title={isHandRaised ? '取消举手' : '举手'}>
            <Button
              type={isHandRaised ? 'primary' : 'default'}
              icon={<RaiseHandOutlined />}
              onClick={onRaiseHand}
            />
          </Tooltip>
        )}

        <Tooltip title="设置">
          <Button
            icon={<SettingOutlined />}
            onClick={onSettings}
          />
        </Tooltip>

        {isHost && (
          <Tooltip title="结束课堂">
            <Button
              danger
              icon={<PoweroffOutlined />}
              onClick={handleEndClass}
            >
              结束课堂
            </Button>
          </Tooltip>
        )}
      </Space>
    </div>
  );
};
