import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Rating,
  Divider,
  Tab,
  Tabs,
  Avatar,
  Skeleton,
  useTheme
} from '@mui/material'
import {
  Favorite,
  FavoriteBorder,
  Share,
  School,
  WorkHistory,
  Schedule,
  Star
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useTutorProfile } from '../../hooks/useTutorProfile'
import { useTutorSocial } from '../../hooks/useTutorSocial'
import { TutorProfile } from '../../types/tutor'
import { ShareDialog } from '../common/ShareDialog'
import { TimeSlotPicker } from '../schedule/TimeSlotPicker'
import { ReviewList } from '../review/ReviewList'
import { ErrorBoundary } from '../common/ErrorBoundary'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tutor-tabpanel-${index}`}
      aria-labelledby={`tutor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export const TutorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const theme = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tutor, loading, error } = useTutorProfile(id!)
  const {
    isFollowing,
    followTutor,
    unfollowTutor,
    loading: socialLoading
  } = useTutorSocial()
  const [tabValue, setTabValue] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (error) {
      // 处理错误，可能显示错误页面或重定向
      console.error('Failed to load tutor:', error)
    }
  }, [error])

  const handleFollowClick = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      if (isFollowing) {
        await unfollowTutor(id!)
      } else {
        await followTutor(id!)
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleBooking = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // 处理预约逻辑
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Container>
    )
  }

  if (!tutor) {
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* 左侧信息卡片 */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Avatar
                src={tutor.user.avatarUrl}
                alt={tutor.user.fullName}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {tutor.user.fullName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating
                  value={tutor.rating}
                  readOnly
                  precision={0.5}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({tutor.totalReviews})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBooking}
                  startIcon={<Schedule />}
                >
                  {t('tutor.book')}
                </Button>
                <IconButton
                  onClick={handleFollowClick}
                  disabled={socialLoading}
                  color={isFollowing ? 'primary' : 'default'}
                >
                  {isFollowing ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={() => setShareOpen(true)}>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {t('tutor.subjects')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tutor.subjects.map((subject, index) => (
                  <Chip key={index} label={subject} size="small" />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <School sx={{ mr: 1 }} />
                {t('tutor.education')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tutor.education}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <WorkHistory sx={{ mr: 1 }} />
                {t('tutor.experience')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tutor.experience}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 右侧内容区 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label={t('tutor.about')} />
              <Tab label={t('tutor.schedule')} />
              <Tab
                label={`${t('tutor.reviews')} (${tutor.totalReviews})`}
              />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1">{tutor.bio}</Typography>
              {tutor.certificates && tutor.certificates.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('tutor.certificates')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tutor.certificates.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <ErrorBoundary>
                <TimeSlotPicker
                  tutorId={id!}
                  availableTimeSlots={tutor.availableTimeSlots}
                  onSlotSelect={handleBooking}
                />
              </ErrorBoundary>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <ErrorBoundary>
                <ReviewList tutorId={id!} />
              </ErrorBoundary>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={t('tutor.share.title', { name: tutor.user.fullName })}
        url={`/tutors/${id}`}
        description={tutor.bio}
        image={tutor.user.avatarUrl}
      />
    </Container>
  )
}
