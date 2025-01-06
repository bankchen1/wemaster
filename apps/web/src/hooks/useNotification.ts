import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { notification } from 'antd';
import { useAuth } from './useAuth';
import { addNotification, markAsRead } from '@/store/slices/notificationSlice';
import { RootState } from '@/store';

export const useNotification = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notification.items);
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);

  const connect = useCallback(() => {
    if (!user) return;

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
      query: {
        userId: user.id,
        role: user.role,
      },
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('notification', (data) => {
      dispatch(addNotification(data));

      // 显示通知
      notification.info({
        message: data.title,
        description: data.content,
        onClick: () => {
          // 点击通知时标记为已读
          dispatch(markAsRead(data.id));
          // 如果有链接，跳转到对应页面
          if (data.link) {
            window.location.href = data.link;
          }
        },
      });
    });

    // 课程相关通知
    newSocket.on('course:start', (data) => {
      notification.info({
        message: '课程即将开始',
        description: \`课程《\${data.courseName}》将在15分钟后开始\`,
        btn: (
          <Button type="primary" size="small" onClick={() => window.location.href = \`/classroom/\${data.courseId}\`}>
            进入教室
          </Button>
        ),
      });
    });

    // 预约相关通知
    newSocket.on('booking:confirmed', (data) => {
      notification.success({
        message: '预约确认',
        description: \`预约课程《\${data.courseName}》已被导师确认\`,
      });
    });

    // 评价相关通知
    newSocket.on('feedback:reminder', (data) => {
      notification.warning({
        message: '评价提醒',
        description: \`课程《\${data.courseName}》的评价将在24小时后截止\`,
        btn: (
          <Button type="primary" size="small" onClick={() => window.location.href = \`/course/\${data.courseId}/feedback\`}>
            立即评价
          </Button>
        ),
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, dispatch]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    connect,
    disconnect,
    notifications,
    unreadCount,
  };
};
