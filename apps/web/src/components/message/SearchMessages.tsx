import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  useTheme,
  alpha
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  CalendarToday as DateIcon,
  Person as PersonIcon,
  Label as LabelIcon
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { debounce } from 'lodash'

interface SearchMessagesProps {
  groupId?: string
  userId?: string
  onClose?: () => void
}

interface SearchResult {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  type: string
  metadata?: any
  highlights?: string[]
}

export const SearchMessages: React.FC<SearchMessagesProps> = ({
  groupId,
  userId,
  onClose
}) => {
  const theme = useTheme()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    sender: '',
    dateRange: '',
    type: ''
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // 使用 debounce 避免频繁搜索
  const debouncedSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        '/api/messages/search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: searchQuery,
            groupId,
            userId,
            filters
          })
        }
      )
      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, 300)

  useEffect(() => {
    debouncedSearch(query)
    return () => debouncedSearch.cancel()
  }, [query, filters])

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const highlightText = (text: string, highlights: string[]) => {
    let highlightedText = text
    highlights.forEach(highlight => {
      const regex = new RegExp(
        `(${highlight})`,
        'gi'
      )
      highlightedText = highlightedText.replace(
        regex,
        '<mark>$1</mark>'
      )
    })
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: highlightedText
        }}
      />
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索框 */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          placeholder="搜索消息..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setQuery('')}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* 筛选器 */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 1,
            flexWrap: 'wrap'
          }}
        >
          <Chip
            icon={<PersonIcon />}
            label="发送者"
            onClick={() =>
              setShowFilters(prev => !prev)
            }
            color={filters.sender ? 'primary' : 'default'}
          />
          <Chip
            icon={<DateIcon />}
            label="时间范围"
            onClick={() =>
              setShowFilters(prev => !prev)
            }
            color={filters.dateRange ? 'primary' : 'default'}
          />
          <Chip
            icon={<LabelIcon />}
            label="消息类型"
            onClick={() =>
              setShowFilters(prev => !prev)
            }
            color={filters.type ? 'primary' : 'default'}
          />
        </Box>
      </Box>

      {/* 搜索结果 */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          bgcolor: alpha(
            theme.palette.background.paper,
            0.8
          )
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 4
            }}
          >
            <CircularProgress />
          </Box>
        ) : results.length > 0 ? (
          <List>
            {results.map(result => (
              <ListItem
                key={result.id}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={result.sender.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="subtitle2">
                        {result.sender.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatDistanceToNow(
                          new Date(result.createdAt),
                          {
                            addSuffix: true,
                            locale: zhCN
                          }
                        )}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    result.highlights ? (
                      highlightText(
                        result.content,
                        result.highlights
                      )
                    ) : (
                      result.content
                    )
                  }
                  secondaryTypographyProps={{
                    sx: {
                      '& mark': {
                        bgcolor: 'warning.light',
                        color: 'warning.dark'
                      }
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        ) : query ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4
            }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
            >
              未找到相关消息
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
