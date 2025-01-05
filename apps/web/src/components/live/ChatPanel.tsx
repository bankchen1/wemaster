import React, { useEffect, useRef, useState } from 'react';
import { Input, Button, List, Avatar, message } from 'antd';
import { SendOutlined, SmileOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import Emoji from 'emoji-picker-react';
import styles from './ChatPanel.module.scss';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'emoji' | 'image';
}

interface ChatPanelProps {
  classId: string;
  userId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ classId, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket>();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 连接WebSocket
    socketRef.current = io(process.env.REACT_APP_WS_URL!, {
      query: { classId, userId },
    });

    // 加载历史消息
    loadHistoryMessages();

    // 设置WebSocket事件监听
    setupSocketListeners();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [classId]);

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      message.success('聊天服务已连接');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      message.error('聊天服务已断开');
    });

    socketRef.current.on('newMessage', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socketRef.current.on('error', (error: any) => {
      message.error('发送消息失败');
      console.error('Chat error:', error);
    });
  };

  const loadHistoryMessages = async () => {
    try {
      const response = await fetch(
        `/api/live-classes/${classId}/messages?limit=50`
      );
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      message.error('加载历史消息失败');
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isConnected) return;

    const newMessage: Partial<ChatMessage> = {
      userId,
      content: inputValue.trim(),
      type: 'text',
      timestamp: new Date(),
    };

    try {
      socketRef.current?.emit('sendMessage', newMessage);
      setInputValue('');
      setShowEmoji(false);
    } catch (error) {
      message.error('发送消息失败');
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (event: any, emojiObject: any) => {
    setInputValue(prev => prev + emojiObject.emoji);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/live-classes/upload-image', {
        method: 'POST',
        body: formData,
      });

      const { imageUrl } = await response.json();

      const newMessage: Partial<ChatMessage> = {
        userId,
        content: imageUrl,
        type: 'image',
        timestamp: new Date(),
      };

      socketRef.current?.emit('sendMessage', newMessage);
    } catch (error) {
      message.error('图片上传失败');
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <div className={styles.chatPanel}>
      <div className={styles.messageList}>
        <List
          dataSource={messages}
          renderItem={msg => (
            <List.Item
              className={msg.userId === userId ? styles.myMessage : ''}
            >
              <List.Item.Meta
                avatar={<Avatar>{msg.userName?.[0]}</Avatar>}
                title={msg.userName}
                description={
                  msg.type === 'image' ? (
                    <img
                      src={msg.content}
                      alt="聊天图片"
                      className={styles.chatImage}
                    />
                  ) : (
                    <div className={styles.messageContent}>
                      {msg.content}
                    </div>
                  )
                }
              />
              <div className={styles.messageTime}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        {showEmoji && (
          <div className={styles.emojiPicker}>
            <Emoji onEmojiClick={onEmojiClick} />
          </div>
        )}
        <div className={styles.inputTools}>
          <Button
            type="text"
            icon={<SmileOutlined />}
            onClick={() => setShowEmoji(!showEmoji)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="imageUpload"
          />
          <Button
            type="text"
            icon={<PictureOutlined />}
            onClick={() => document.getElementById('imageUpload')?.click()}
          />
        </div>
        <Input.TextArea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          autoSize={{ minRows: 1, maxRows: 4 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={!isConnected || !inputValue.trim()}
        >
          发送
        </Button>
      </div>
    </div>
  );
};
