import React from 'react'
import {
  Box,
  Typography,
  Button,
  useTheme,
  alpha
} from '@mui/material'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  illustration?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  illustration = '/assets/images/empty-state.svg'
}) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        minHeight: 400,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.light,
          0.1
        )}, ${alpha(theme.palette.primary.main, 0.05)})`,
        borderRadius: 2
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {icon && (
          <Box
            sx={{
              mb: 2,
              color: theme.palette.primary.main,
              '& svg': {
                fontSize: 64
              }
            }}
          >
            {icon}
          </Box>
        )}
        {illustration && (
          <Box
            component="img"
            src={illustration}
            alt={title}
            sx={{
              width: '100%',
              maxWidth: 300,
              height: 'auto',
              mb: 3
            }}
          />
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Typography variant="h5" gutterBottom align="center">
          {title}
        </Typography>
      </motion.div>

      {description && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 3, maxWidth: 500 }}
          >
            {description}
          </Typography>
        </motion.div>
      )}

      {action && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            variant="contained"
            onClick={action.onClick}
            size="large"
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </Box>
  )
}
