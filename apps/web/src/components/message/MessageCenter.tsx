import React, { useState, useEffect } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Badge,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  useTheme
} from '@mui/material'
import {
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Alarm as AlarmIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  type: string
  title: string
  content: string
  sender?: {
    id: string
    name: string
    avatar?: string
  }
  status: {
    read: boolean
    readAt?: Date
  }
  metadata?: any
  createdAt: Date
}

interface MessageCenterProps {
  userId: string
  onMessageClick?: (message: Message) => void
  onChatStart?: (userId: string) => void
}

export const MessageCenter: React.FC<MessageCenterProps> = ({
  userId,
  onMessageClick,
  onChatStart
}) => {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState('all')
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCounts, setUnreadCounts] = useState({
    all: 0,
    chat: 0,
    system: 0,
    marketing: 0,
    event: 0,
    reminder: 0
  })

  // 获取消息列表
  useEffect(() => {
    fetchMessages()
    fetchUnreadCounts()
    // 建立 WebSocket 连接
    const ws = new WebSocket(
      `ws://localhost:3000/ws/messages?userId=${userId}`
    )

    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      if (data.type === 'new_message') {
        handleNewMessage(data.message)
      }
    }

    return () => ws.close()
  }, [userId])

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/messages?userId=${userId}&type=${activeTab}`
      )
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const fetchUnreadCounts = async () => {
    try {
      const response = await fetch(
        `/api/messages/unread-count?userId=${userId}`
      )
      const data = await response.json()
      setUnreadCounts(data)
    } catch (error) {
      console.error(
        'Failed to fetch unread counts:',
        error
      )
    }
  }

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [message, ...prev])
    setUnreadCounts(prev => ({
      ...prev,
      all: prev.all + 1,
      [message.type.toLowerCase()]:
        prev[message.type.toLowerCase()] + 1
    }))
  }

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setActiveTab(newValue)
    fetchMessages()
  }

  const handleMessageClick = async (message: Message) => {
    if (!message.status.read) {
      try {
        await fetch(`/api/messages/${message.id}/read`, {
          method: 'POST'
        })
        
        // 更新未读计数
        setUnreadCounts(prev => ({
          ...prev,
          all: prev.all - 1,
          [message.type.toLowerCase()]:
            prev[message.type.toLowerCase()] - 1
        }))

        // 更新消息状态
        setMessages(prev =>
          prev.map(m =>
            m.id === message.id
              ? {
                  ...m,
                  status: { ...m.status, read: true }
                }
              : m
          )
        )
      } catch (error) {
        console.error(
          'Failed to mark message as read:',
          error
        )
      }
    }

    onMessageClick?.(message)

    // 如果是聊天消息，启动聊天
    if (
      message.type === 'CHAT' &&
      message.sender &&
      onChatStart
    ) {
      onChatStart(message.sender.id)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/messages/mark-all-read', {
        method: 'POST',
        body: JSON.stringify({ userId }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      setUnreadCounts({
        all: 0,
        chat: 0,
        system: 0,
        marketing: 0,
        event: 0,
        reminder: 0
      })

      setMessages(prev =>
        prev.map(m => ({
          ...m,
          status: { ...m.status, read: true }
        }))
      )
    } catch (error) {
      console.error(
        'Failed to mark all messages as read:',
        error
      )
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'CHAT':
        return <ChatIcon />
      case 'SYSTEM':
        return <NotificationsIcon />
      case 'MARKETING':
        return <CampaignIcon />
      case 'EVENT':
        return <EventIcon />
      case 'REMINDER':
        return <AlarmIcon />
      default:
        return <NotificationsIcon />
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: theme.shadows[1]
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6">消息中心</Typography>
        <Box>
          <IconButton
            onClick={handleMarkAllRead}
            disabled={unreadCounts.all === 0}
          >
            <MarkReadIcon />
          </IconButton>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 2 }}
      >
        <Tab
          label={
            <Badge
              badgeContent={unreadCounts.all}
              color="primary"
            >
              全部
            </Badge>
          }
          value="all"
        />
        <Tab
          label={
            <Badge
              badgeContent={unreadCounts.chat}
              color="primary"
            >
              聊天
            </Badge>
          }
          value="chat"
        />
        <Tab
          label={
            <Badge
              badgeContent={unreadCounts.system}
              color="primary"
            >
              系统
            </Badge>
          }
          value="system"
        />
        <Tab
          label={
            <Badge
              badgeContent={unreadCounts.marketing}
              color="primary"
            >
              营销
            </Badge>
          }
          value="marketing"
        />
        <Tab
          label={
            <Badge
              badgeContent={unreadCounts.event}
              color="primary"
            >
              事件
            </Badge>
          }
          value="event"
        />
        <Tab
          label={
            <Badge
              badgeContent={unreadCounts.reminder}
              color="primary"
            >
              提醒
            </Badge>
          }
          value="reminder"
        />
      </Tabs>

      <List sx={{ maxHeight: 500, overflow: 'auto' }}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.2,
                delay: index * 0.05
              }}
            >
              <ListItem
                button
                onClick={() => handleMessageClick(message)}
                sx={{
                  bgcolor: message.status.read
                    ? 'transparent'
                    : alpha(
                        theme.palette.primary.main,
                        0.05
                      )
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={message.sender?.avatar}
                    sx={{
                      bgcolor: message.status.read
                        ? 'grey.300'
                        : 'primary.main'
                    }}
                  >
                    {getMessageIcon(message.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: message.status.read
                          ? 'normal'
                          : 'bold'
                      }}
                    >
                      {message.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {message.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatDistanceToNow(
                          new Date(message.createdAt),
                          {
                            addSuffix: true,
                            locale: zhCN
                          }
                        )}
                      </Typography>
                    </>
                  }
                />
                {message.metadata?.action && (
                  <IconButton
                    size="small"
                    onClick={e => {
                      e.stopPropagation()
                      // 处理操作按钮点击
                    }}
                  >
                    {/* 根据 action 类型显示不同图标 */}
                  </IconButton>
                )}
              </ListItem>
              {index < messages.length - 1 && <Divider />}
            </motion.div>
          ))}
        </AnimatePresence>
      </List>
    </Box>
  )
}
