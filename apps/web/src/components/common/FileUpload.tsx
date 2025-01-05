import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Typography
} from '@mui/material'
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  Image,
  VideoLibrary
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border .3s ease-in-out',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.dark
  }
}))

const PreviewContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& img': {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain'
  },
  '& video': {
    maxWidth: '100%',
    maxHeight: '200px'
  }
}))

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onUpload: (files: File[]) => Promise<string[]>
  onDelete?: (url: string) => Promise<void>
  value?: string[]
  onChange?: (urls: string[]) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/*,video/*,application/pdf',
  multiple = true,
  maxSize = 50 * 1024 * 1024, // 50MB
  onUpload,
  onDelete,
  value = [],
  onChange
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setError(null)
    setProgress(new Array(acceptedFiles.length).fill(0))

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress(prev => 
          prev.map(p => p < 90 ? p + 10 : p)
        )
      }, 500)

      const urls = await onUpload(acceptedFiles)
      
      clearInterval(progressInterval)
      setProgress(new Array(acceptedFiles.length).fill(100))
      
      if (onChange) {
        onChange([...value, ...urls])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }, [onUpload, onChange, value])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => ({
      ...acc,
      [curr]: []
    }), {}),
    multiple,
    maxSize
  })

  const handleDelete = async (url: string, index: number) => {
    if (onDelete) {
      try {
        await onDelete(url)
        if (onChange) {
          onChange(value.filter((_, i) => i !== index))
        }
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const renderPreview = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <img src={url} alt="preview" />
    }
    if (url.match(/\.(mp4|webm)$/i)) {
      return <video src={url} controls />
    }
    return null
  }

  const getFileIcon = (url: string) => {
    if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <Image />
    }
    if (url.match(/\.(mp4|webm)$/i)) {
      return <VideoLibrary />
    }
    return <InsertDriveFile />
  }

  return (
    <Box>
      <DropzoneContainer {...getRootProps()}>
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        {isDragActive ? (
          <Typography>将文件拖放到此处...</Typography>
        ) : (
          <Typography>
            点击或将文件拖放到此处上传
            <br />
            <small>
              支持的文件类型: {accept}
              <br />
              最大文件大小: {maxSize / 1024 / 1024}MB
            </small>
          </Typography>
        )}
      </DropzoneContainer>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {uploading && progress.map((p, i) => (
        <Box key={i} sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={p} />
          <Typography variant="caption">
            上传进度: {p}%
          </Typography>
        </Box>
      ))}

      {value.length > 0 && (
        <List>
          {value.map((url, index) => (
            <ListItem key={url}>
              <ListItemIcon>
                {getFileIcon(url)}
              </ListItemIcon>
              <ListItemText
                primary={url.split('/').pop()}
                secondary={renderPreview(url) && (
                  <PreviewContainer>
                    {renderPreview(url)}
                  </PreviewContainer>
                )}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(url, index)}
                  disabled={uploading}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  )
}
