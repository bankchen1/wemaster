import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Chip,
  Rating,
  Tooltip,
  Skeleton
} from '@mui/material'
import {
  Favorite,
  FavoriteBorder,
  Share,
  School,
  Star
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTutorSocial } from '../../hooks/useTutorSocial'
import { TutorProfile } from '../../types/tutor'
import { ShareDialog } from '../common/ShareDialog'

interface TutorCardProps {
  tutor: TutorProfile
  onFollow?: (tutorId: string) => void
  onUnfollow?: (tutorId: string) => void
}

export const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  onFollow,
  onUnfollow
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFollowing, followTutor, unfollowTutor } = useTutorSocial()
  const [loading, setLoading] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      if (isFollowing) {
        await unfollowTutor(tutor.id)
        onUnfollow?.(tutor.id)
      } else {
        await followTutor(tutor.id)
        onFollow?.(tutor.id)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShareOpen(true)
  }

  const handleCardClick = () => {
    navigate(`/tutors/${tutor.id}`)
  }

  return (
    <>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 6
          }
        }}
        onClick={handleCardClick}
      >
        <CardMedia
          component="img"
          height="200"
          image={tutor.user.avatarUrl || '/default-avatar.png'}
          alt={tutor.user.fullName}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1
            }}
          >
            <Typography variant="h6" component="div">
              {tutor.user.fullName}
            </Typography>
            <Box>
              <IconButton
                onClick={handleShareClick}
                size="small"
                sx={{ mr: 1 }}
              >
                <Share />
              </IconButton>
              <IconButton
                onClick={handleFollowClick}
                disabled={loading}
                size="small"
                color={isFollowing ? 'primary' : 'default'}
              >
                {loading ? (
                  <Skeleton variant="circular" width={24} height={24} />
                ) : isFollowing ? (
                  <Favorite />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <School sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {tutor.education}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              value={tutor.rating}
              readOnly
              precision={0.5}
              size="small"
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              ({tutor.totalReviews})
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {tutor.bio}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tutor.subjects.slice(0, 3).map((subject, index) => (
              <Chip
                key={index}
                label={subject}
                size="small"
                onClick={e => e.stopPropagation()}
              />
            ))}
            {tutor.subjects.length > 3 && (
              <Tooltip title={tutor.subjects.slice(3).join(', ')}>
                <Chip
                  label={`+${tutor.subjects.length - 3}`}
                  size="small"
                  onClick={e => e.stopPropagation()}
                />
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={t('tutor.share.title', { name: tutor.user.fullName })}
        url={`/tutors/${tutor.id}`}
        description={tutor.bio}
        image={tutor.user.avatarUrl}
      />
    </>
  )
}
