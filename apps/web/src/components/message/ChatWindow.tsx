import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  useTheme,
  alpha
} from '@mui/material'
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import EmojiPicker from 'emoji-picker-react'

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
  status: 'sent' | 'delivered' | 'read'
  type: 'text' | 'image' | 'file'
  metadata?: any
}

interface ChatWindowProps {
  roomId: string
  currentUserId: string
  otherUser: {
    id: string
    name: string
    avatar?: string
    role: string
    status: 'online' | 'offline' | 'away'
  }
  onClose?: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  roomId,
  currentUserId,
  otherUser,
  onClose
}) => {
  const theme = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 加载历史消息
    fetchMessages()

    // 建立 WebSocket 连接
    const ws = new WebSocket(
      `ws://localhost:3000/ws/chat/${roomId}?userId=${currentUserId}`
    )

    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    }

    return () => ws.close()
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/chat/${roomId}/messages`
      )
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => [...prev, data.message])
        break
      case 'typing_start':
        if (data.userId === otherUser.id) {
          setIsTyping(true)
        }
        break
      case 'typing_end':
        if (data.userId === otherUser.id) {
          setIsTyping(false)
        }
        break
      case 'message_status':
        updateMessageStatus(data.messageId, data.status)
        break
    }
  }

  const updateMessageStatus = (
    messageId: string,
    status: string
  ) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, status } : m
      )
    )
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: currentUserId,
      createdAt: new Date(),
      status: 'sent',
      type: 'text'
    }

    try {
      const response = await fetch(
        `/api/chat/${roomId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        }
      )

      if (response.ok) {
        setMessages(prev => [...prev, message])
        setNewMessage('')
        setShowEmojiPicker(false)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(
        `/api/chat/${roomId}/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (response.ok) {
        const data = await response.json()
        const message = {
          id: Date.now().toString(),
          content: data.url,
          senderId: currentUserId,
          createdAt: new Date(),
          status: 'sent',
          type: file.type.startsWith('image/')
            ? 'image'
            : 'file',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        }

        setMessages(prev => [...prev, message])
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
    }
  }

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.emoji)
  }

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === currentUserId

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <ListItem
          sx={{
            flexDirection: isOwnMessage
              ? 'row-reverse'
              : 'row'
          }}
        >
          <ListItemAvatar>
            <Avatar
              src={
                isOwnMessage
                  ? undefined
                  : otherUser.avatar
              }
            />
          </ListItemAvatar>
          <Box
            sx={{
              maxWidth: '70%',
              ml: isOwnMessage ? 0 : 1,
              mr: isOwnMessage ? 1 : 0
            }}
          >
            <Paper
              sx={{
                p: 1.5,
                bgcolor: isOwnMessage
                  ? 'primary.main'
                  : 'grey.100',
                color: isOwnMessage ? 'white' : 'inherit',
                borderRadius: 2
              }}
            >
              {message.type === 'text' && (
                <Typography>{message.content}</Typography>
              )}
              {message.type === 'image' && (
                <Box
                  component="img"
                  src={message.content}
                  sx={{
                    maxWidth: '100%',
                    borderRadius: 1
                  }}
                />
              )}
              {message.type === 'file' && (
                <Button
                  startIcon={<AttachFileIcon />}
                  href={message.content}
                  download
                  sx={{
                    color: isOwnMessage
                      ? 'inherit'
                      : 'primary'
                  }}
                >
                  {message.metadata?.fileName}
                </Button>
              )}
            </Paper>
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: 'block',
                textAlign: isOwnMessage ? 'right' : 'left',
                color: 'text.secondary'
              }}
            >
              {formatDistanceToNow(
                new Date(message.createdAt),
                {
                  addSuffix: true,
                  locale: zhCN
                }
              )}
            </Typography>
          </Box>
        </ListItem>
      </motion.div>
    )
  }

  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: 600,
        height: 500,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 头部 */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={otherUser.avatar}
            sx={{ mr: 1 }}
          />
          <Box>
            <Typography variant="subtitle1">
              {otherUser.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {otherUser.status}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 消息列表 */}
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: alpha(theme.palette.background.paper, 0.8)
        }}
      >
        <AnimatePresence>
          {messages.map(message => (
            <React.Fragment key={message.id}>
              {renderMessage(message)}
            </React.Fragment>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </List>

      {/* 输入区域 */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        {isTyping && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: 'block' }}
          >
            对方正在输入...
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <IconButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <EmojiIcon />
          </IconButton>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
          >
            <AttachFileIcon />
          </IconButton>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            sx={{ mx: 1 }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
        {showEmojiPicker && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              zIndex: 1
            }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
            />
          </Box>
        )}
      </Box>
    </Paper>
  )
}
