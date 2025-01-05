import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  Grid
} from '@mui/material'
import {
  PlayArrow,
  Pause,
  FullscreenExit,
  Fullscreen,
  YouTube
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const PreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: 200,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}))

const MediaControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  '&:hover': {
    opacity: 1
  }
}))

const YouTubeEmbed = styled('iframe')({
  width: '100%',
  height: '100%',
  border: 'none'
})

interface MediaPreviewProps {
  url: string
  title?: string
  description?: string
  type?: 'image' | 'video' | 'youtube'
  thumbnail?: string
  onError?: (error: Error) => void
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  url,
  title,
  description,
  type = 'image',
  thumbnail,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleMouseEnter = () => {
    setShowControls(true)
  }

  const handleMouseLeave = () => {
    setShowControls(false)
  }

  const handleError = (error: Error) => {
    console.error('Media error:', error)
    if (onError) {
      onError(error)
    }
  }

  const renderMedia = () => {
    switch (type) {
      case 'image':
        return (
          <CardMedia
            component="img"
            image={url}
            alt={title}
            sx={{
              height: 0,
              paddingTop: '56.25%', // 16:9 aspect ratio
              objectFit: 'cover'
            }}
            onError={() => handleError(new Error('Image failed to load'))}
          />
        )

      case 'video':
        return (
          <Box
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{ position: 'relative' }}
          >
            <video
              src={url}
              poster={thumbnail}
              controls={showControls}
              playing={isPlaying}
              style={{ width: '100%', height: 'auto' }}
              onError={() => handleError(new Error('Video failed to load'))}
            />
            {showControls && (
              <MediaControls>
                <IconButton color="inherit" onClick={handlePlay}>
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton color="inherit" onClick={handleFullscreen}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </MediaControls>
            )}
          </Box>
        )

      case 'youtube':
        return (
          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
            <YouTubeEmbed
              src={url}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Card>
        <PreviewContainer>
          {renderMedia()}
        </PreviewContainer>
        {(title || description) && (
          <CardContent>
            {title && (
              <Typography gutterBottom variant="h6" component="div">
                {title}
              </Typography>
            )}
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </CardContent>
        )}
      </Card>

      <Dialog
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {renderMedia()}
        </DialogContent>
      </Dialog>
    </>
  )
}

interface MediaGalleryProps {
  items: Array<{
    url: string
    title?: string
    description?: string
    type?: 'image' | 'video' | 'youtube'
    thumbnail?: string
  }>
  columns?: number
  spacing?: number
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  columns = 3,
  spacing = 2
}) => {
  return (
    <Grid container spacing={spacing}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} md={12 / columns} key={index}>
          <MediaPreview {...item} />
        </Grid>
      ))}
    </Grid>
  )
}
