import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Message, MessageType } from '@wemaster/shared/types/message';
import { useMessageStore } from '../../stores/messageStore';
import { useAuth } from '../../hooks/useAuth';

const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const {
    messages,
    loadMessages,
    sendMessage,
    markAsRead,
  } = useMessageStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      markAsRead(conversationId);
    }
  }, [conversationId, loadMessages, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return;

    try {
      await sendMessage({
        conversationId,
        content: newMessage,
        type: MessageType.TEXT,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleAttachFile = () => {
    // 实现文件上传逻辑
  };

  const handleAttachImage = () => {
    // 实现图片上传逻辑
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === user?.id;

    return (
      <ListItem
        key={message.id}
        sx={{
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        <Avatar
          src={`/api/users/${message.senderId}/avatar`}
          sx={{ width: 40, height: 40 }}
        />
        <Box
          sx={{
            maxWidth: '70%',
            bgcolor: isOwnMessage ? 'primary.light' : 'grey.100',
            borderRadius: 2,
            p: 1,
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
          >
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: zhCN,
            })}
          </Typography>
        </Box>
      </ListItem>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={`/api/conversations/${conversationId}/avatar`} />
        <Typography variant="h6" sx={{ flex: 1 }}>
          对话名称
        </Typography>
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Paper>

      <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </List>

      <Divider />

      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton onClick={handleAttachFile}>
          <AttachFileIcon />
        </IconButton>
        <IconButton onClick={handleAttachImage}>
          <ImageIcon />
        </IconButton>
        <InputBase
          sx={{ flex: 1 }}
          placeholder="输入消息..."
          multiline
          maxRows={4}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <IconButton onClick={handleSend} disabled={!newMessage.trim()}>
          <SendIcon />
        </IconButton>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>清空聊天记录</MenuItem>
        <MenuItem onClick={handleMenuClose}>屏蔽用户</MenuItem>
        <MenuItem onClick={handleMenuClose}>举报</MenuItem>
      </Menu>
    </Box>
  );
};

export default Chat;
