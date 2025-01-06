import React, { useEffect } from 'react';
import { useAlert } from './AlertProvider';
import { useWebSocket } from '../../hooks/useWebSocket';

export const SystemAlert: React.FC = () => {
  const { showAlert } = useAlert();
  const socket = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    // 监听系统告警
    socket.on('system:alert', (data: { message: string; type: 'success' | 'error' | 'warning' | 'info' }) => {
      showAlert(data.message, data.type);
    });

    // 监听系统维护
    socket.on('system:maintenance', (data: { message: string }) => {
      showAlert(data.message, 'warning');
    });

    // 监听系统错误
    socket.on('system:error', (data: { message: string }) => {
      showAlert(data.message, 'error');
    });

    return () => {
      socket.off('system:alert');
      socket.off('system:maintenance');
      socket.off('system:error');
    };
  }, [socket, showAlert]);

  return null;
};

export default SystemAlert;
