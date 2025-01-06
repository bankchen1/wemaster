import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Paper,
  IconButton,
  InputBase,
  Badge,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Conversation, ConversationType } from '@wemaster/shared/types/message';
import { useMessageStore } from '../../stores/messageStore';

const MessageInbox: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const navigate = useNavigate();
  const { conversations, fetchConversations } = useMessageStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleConversationClick = (conversationId: string) => {
    navigate(`/message/chat/${conversationId}`);
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.participants.some(participant =>
      participant.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const renderAvatar = (conversation: Conversation) => {
    if (conversation.type === ConversationType.GROUP) {
      return (
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {conversation.participants.length}
        </Avatar>
      );
    }
    return (
      <Avatar src={`/api/users/${conversation.participants[0]}/avatar`} />
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          mb: 2,
        }}
      >
        <IconButton sx={{ p: '10px' }}>
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="搜索对话"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Paper>

      <List sx={{ width: '100%', bgcolor: 'background.paper', flex: 1, overflow: 'auto' }}>
        {filteredConversations.map((conversation) => (
          <React.Fragment key={conversation.id}>
            <ListItem
              alignItems="flex-start"
              button
              selected={selectedConversation === conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={conversation.unreadCount}
                  color="primary"
                  invisible={conversation.unreadCount === 0}
                >
                  {renderAvatar(conversation)}
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    component="span"
                    variant="subtitle1"
                    color="text.primary"
                  >
                    {conversation.participants.join(', ')}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {conversation.lastMessage?.content}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      {formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </Typography>
                  </React.Fragment>
                }
              />
              <IconButton edge="end">
                <MoreVertIcon />
              </IconButton>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default MessageInbox;
