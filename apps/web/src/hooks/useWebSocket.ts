import { useEffect, useCallback, useState } from 'react';
import { WebSocketService } from '@/services/websocket.service';

export function useWebSocket(sessionId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const ws = WebSocketService.getInstance();

  useEffect(() => {
    // 连接 WebSocket
    ws.connect(sessionId);

    // 监听连接状态
    ws.on('connection:status', ({ connected, reason }) => {
      setIsConnected(connected);
      if (!connected) {
        setError(new Error(`Disconnected: ${reason}`));
      } else {
        setError(null);
      }
    });

    // 监听错误
    ws.on('error', (err) => {
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
    });

    return () => {
      ws.disconnect();
    };
  }, [sessionId]);

  // 聊天功能
  const sendMessage = useCallback((content: string) => {
    ws.sendChatMessage(content);
  }, []);

  // 白板功能
  const updateWhiteboard = useCallback((action: string, payload: any) => {
    ws.sendWhiteboardUpdate(action, payload);
  }, []);

  // 举手功能
  const raiseHand = useCallback(() => {
    ws.sendHandRaise();
  }, []);

  // 录制功能
  const startRecording = useCallback(() => {
    ws.startRecording();
  }, []);

  const stopRecording = useCallback(() => {
    ws.stopRecording();
  }, []);

  // 添加自定义事件监听器
  const addEventListener = useCallback((event: string, callback: Function) => {
    ws.on(event, callback);
    return () => ws.off(event, callback);
  }, []);

  return {
    isConnected,
    error,
    sendMessage,
    updateWhiteboard,
    raiseHand,
    startRecording,
    stopRecording,
    addEventListener,
  };
}
