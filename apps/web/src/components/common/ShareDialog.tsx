import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Box,
  Typography
} from '@mui/material'
import {
  Close,
  ContentCopy,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from 'notistack'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  title: string
  url: string
  description?: string
  image?: string
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  title,
  url,
  description,
  image
}) => {
  const { t } = useTranslation()
  const { enqueueSnackbar } = useSnackbar()
  const fullUrl = `${window.location.origin}${url}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      enqueueSnackbar(t('common.copied'), { variant: 'success' })
    } catch (error) {
      console.error('Failed to copy:', error)
      enqueueSnackbar(t('common.copyFailed'), { variant: 'error' })
    }
  }

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        fullUrl
      )}&quote=${encodeURIComponent(title)}`
    },
    {
      name: 'Twitter',
      icon: <Twitter />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        fullUrl
      )}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'LinkedIn',
      icon: <LinkedIn />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        fullUrl
      )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
        description || ''
      )}`
    },
    {
      name: 'WhatsApp',
      icon: <WhatsApp />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        title + ' ' + fullUrl
      )}`
    }
  ]

  const handleShare = (platform: string, url: string) => {
    window.open(url, `share-${platform}`, 'width=600,height=400')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {t('share.title')}
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {image && (
          <Box
            component="img"
            src={image}
            alt={title}
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
              mb: 2
            }}
          />
        )}

        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {description}
          </Typography>
        )}

        <TextField
          fullWidth
          value={fullUrl}
          variant="outlined"
          size="small"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton
                edge="end"
                onClick={handleCopyLink}
                size="small"
              >
                <ContentCopy />
              </IconButton>
            )
          }}
          sx={{ mb: 2 }}
        />

        <List>
          {shareLinks.map(platform => (
            <ListItem
              key={platform.name}
              button
              onClick={() => handleShare(platform.name, platform.url)}
            >
              <ListItemIcon>{platform.icon}</ListItemIcon>
              <ListItemText primary={platform.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
