import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  AvatarGroup,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  useTheme
} from '@mui/material'
import {
  MoreVert as MoreIcon,
  PersonAdd as AddPersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LeaveIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import { ChatWindow } from './ChatWindow'
import { SearchMessages } from './SearchMessages'

interface GroupChatProps {
  groupId: string
  currentUserId: string
  onClose?: () => void
}

interface GroupMember {
  id: string
  name: string
  avatar?: string
  role: 'admin' | 'member'
  status: 'online' | 'offline' | 'away'
}

interface GroupInfo {
  id: string
  name: string
  description?: string
  avatar?: string
  members: GroupMember[]
  createdAt: Date
  settings: {
    allowMemberInvite: boolean
    allowMemberMessage: boolean
    allowFileShare: boolean
  }
}

export const GroupChat: React.FC<GroupChatProps> = ({
  groupId,
  currentUserId,
  onClose
}) => {
  const theme = useTheme()
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(
    null
  )
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(
    null
  )
  const [showMembers, setShowMembers] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    fetchGroupInfo()
  }, [groupId])

  const fetchGroupInfo = async () => {
    try {
      const response = await fetch(
        `/api/groups/${groupId}`
      )
      const data = await response.json()
      setGroupInfo(data)
    } catch (error) {
      console.error('Failed to fetch group info:', error)
    }
  }

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleInviteMember = async () => {
    if (!inviteEmail) return

    try {
      await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: inviteEmail })
      })

      setInviteEmail('')
      setShowInvite(false)
      fetchGroupInfo()
    } catch (error) {
      console.error('Failed to invite member:', error)
    }
  }

  const handleLeaveGroup = async () => {
    try {
      await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST'
      })
      onClose?.()
    } catch (error) {
      console.error('Failed to leave group:', error)
    }
  }

  const handleUpdateSettings = async (
    settings: Partial<GroupInfo['settings']>
  ) => {
    try {
      await fetch(`/api/groups/${groupId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      fetchGroupInfo()
    } catch (error) {
      console.error(
        'Failed to update group settings:',
        error
      )
    }
  }

  const isAdmin = groupInfo?.members.find(
    m => m.id === currentUserId
  )?.role === 'admin'

  return (
    <Box sx={{ height: '100%', display: 'flex' }}>
      {/* 群聊主窗口 */}
      <Box sx={{ flex: 1 }}>
        <ChatWindow
          roomId={groupId}
          currentUserId={currentUserId}
          otherUser={{
            id: groupId,
            name: groupInfo?.name || '',
            avatar: groupInfo?.avatar,
            role: 'group',
            status: 'online'
          }}
        />
      </Box>

      {/* 群组信息侧边栏 */}
      {groupInfo && (
        <Paper
          sx={{
            width: 300,
            borderLeft: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
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
            <Typography variant="h6">群组信息</Typography>
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Avatar
                src={groupInfo.avatar}
                sx={{ width: 64, height: 64, mr: 2 }}
              />
              <Box>
                <Typography variant="h6">
                  {groupInfo.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {groupInfo.members.length} 位成员
                </Typography>
              </Box>
            </Box>

            {groupInfo.description && (
              <Typography
                variant="body2"
                sx={{ mb: 2 }}
              >
                {groupInfo.description}
              </Typography>
            )}

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              群组成员
            </Typography>
            <AvatarGroup max={5} sx={{ mb: 2 }}>
              {groupInfo.members.map(member => (
                <Avatar
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                />
              ))}
            </AvatarGroup>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={() => setShowSearch(true)}
              sx={{ mb: 1 }}
            >
              搜索消息
            </Button>

            {isAdmin && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddPersonIcon />}
                onClick={() => setShowInvite(true)}
              >
                邀请成员
              </Button>
            )}
          </Box>
        </Paper>
      )}

      {/* 菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            setShowMembers(true)
          }}
        >
          查看成员
        </MenuItem>
        {isAdmin && (
          <MenuItem
            onClick={() => {
              handleMenuClose()
              setShowSettings(true)
            }}
          >
            群组设置
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleMenuClose()
            handleLeaveGroup()
          }}
          sx={{ color: 'error.main' }}
        >
          退出群组
        </MenuItem>
      </Menu>

      {/* 成员列表对话框 */}
      <Dialog
        open={showMembers}
        onClose={() => setShowMembers(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>群组成员</DialogTitle>
        <DialogContent>
          <List>
            {groupInfo?.members.map(member => (
              <ListItem
                key={member.id}
                secondaryAction={
                  <Chip
                    label={member.role}
                    size="small"
                    color={
                      member.role === 'admin'
                        ? 'primary'
                        : 'default'
                    }
                  />
                }
              >
                <ListItemAvatar>
                  <Avatar src={member.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.status}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* 设置对话框 */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>群组设置</DialogTitle>
        <DialogContent>
          {groupInfo && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="群组名称"
                defaultValue={groupInfo.name}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="群组描述"
                defaultValue={groupInfo.description}
                sx={{ mb: 2 }}
              />
              {Object.entries(groupInfo.settings).map(
                ([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1
                    }}
                  >
                    <Typography>
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(
                          /^./,
                          str => str.toUpperCase()
                        )}
                    </Typography>
                    <Button
                      variant={value ? 'contained' : 'outlined'}
                      onClick={() =>
                        handleUpdateSettings({
                          [key]: !value
                        })
                      }
                    >
                      {value ? '启用' : '禁用'}
                    </Button>
                  </Box>
                )
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* 邀请对话框 */}
      <Dialog
        open={showInvite}
        onClose={() => setShowInvite(false)}
      >
        <DialogTitle>邀请成员</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="邮箱地址"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInvite(false)}>
            取消
          </Button>
          <Button
            onClick={handleInviteMember}
            variant="contained"
          >
            邀请
          </Button>
        </DialogActions>
      </Dialog>

      {/* 搜索对话框 */}
      <Dialog
        open={showSearch}
        onClose={() => setShowSearch(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>搜索消息</DialogTitle>
        <DialogContent>
          <SearchMessages
            groupId={groupId}
            onClose={() => setShowSearch(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
