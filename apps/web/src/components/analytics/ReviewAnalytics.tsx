import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab'
import {
  TrendingUp,
  TrendingDown,
  Star,
  Schedule,
  Comment,
  ThumbUp,
  Warning,
  CheckCircle,
  Lightbulb
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { useReviewAnalytics } from '../../hooks/useReviewAnalytics'
import { formatDistance } from 'date-fns'
import { Skeleton } from '@mui/material'

interface ReviewAnalyticsProps {
  tutorId: string
}

export const ReviewAnalytics: React.FC<ReviewAnalyticsProps> = ({
  tutorId
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const {
    analytics,
    insights,
    similarTutors,
    loading,
    error
  } = useReviewAnalytics(tutorId)

  if (error) {
    return (
      <Typography color="error">
        {t('analytics.error.loading')}
      </Typography>
    )
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => (
          <Grid item xs={12} md={6} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={200} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  const {
    ratingDistribution,
    tagAnalytics,
    trends,
    summary
  } = analytics

  return (
    <Box>
      {/* 概要卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t('analytics.totalReviews')}
              </Typography>
              <Typography variant="h4">
                {summary.totalReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t('analytics.averageRating')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ mr: 1 }}>
                  {summary.averageRating.toFixed(1)}
                </Typography>
                <Star color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t('analytics.responseRate')}
              </Typography>
              <Typography variant="h4">
                {summary.responseRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {t('analytics.avgResponseTime')}
              </Typography>
              <Typography variant="h4">
                {summary.averageResponseTime.toFixed(1)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 评分分布和趋势 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.ratingDistribution')}
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ratingDistribution}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="rating"
                      type="category"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="percentage"
                      fill={theme.palette.primary.main}
                      name={t('analytics.percentage')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.ratingTrends')}
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trends}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={date =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={date =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="averageRating"
                      stroke={theme.palette.primary.main}
                      name={t('analytics.rating')}
                    />
                    <Line
                      type="monotone"
                      dataKey="reviewCount"
                      stroke={theme.palette.secondary.main}
                      name={t('analytics.count')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 标签分析和洞察 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.tagAnalytics')}
              </Typography>
              <List>
                {tagAnalytics.map(tag => (
                  <ListItem key={tag.tag}>
                    <ListItemText
                      primary={tag.tag}
                      secondary={`${t('analytics.count')}: ${
                        tag.count
                      } | ${t('analytics.avgRating')}: ${tag.averageRating.toFixed(
                        1
                      )}`}
                    />
                    <Box
                      sx={{
                        width: 100,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={(tag.averageRating / 5) * 100}
                        sx={{ flexGrow: 1, mr: 1 }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {tag.averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('analytics.insights')}
              </Typography>
              <Timeline>
                {insights.strengths.length > 0 && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="success">
                        <CheckCircle />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="h6">
                        {t('analytics.strengths')}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {insights.strengths.map(strength => (
                          <Chip
                            key={strength}
                            label={strength}
                            color="success"
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    </TimelineContent>
                  </TimelineItem>
                )}
                {insights.improvements.length > 0 && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="warning">
                        <Warning />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="h6">
                        {t('analytics.improvements')}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {insights.improvements.map(improvement => (
                          <Chip
                            key={improvement}
                            label={improvement}
                            color="warning"
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    </TimelineContent>
                  </TimelineItem>
                )}
                {insights.recommendations.length > 0 && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="info">
                        <Lightbulb />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="h6">
                        {t('analytics.recommendations')}
                      </Typography>
                      <List>
                        {insights.recommendations.map(
                          (recommendation, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Lightbulb color="info" />
                              </ListItemIcon>
                              <ListItemText primary={recommendation} />
                            </ListItem>
                          )
                        )}
                      </List>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 相似导师 */}
      {similarTutors.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('analytics.similarTutors')}
            </Typography>
            <Grid container spacing={2}>
              {similarTutors.map(tutor => (
                <Grid item xs={12} sm={6} md={4} key={tutor.id}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Avatar
                      src={tutor.user.avatarUrl}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">
                        {tutor.user.fullName}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mt: 0.5
                        }}
                      >
                        <Star
                          sx={{
                            color: theme.palette.warning.main,
                            fontSize: 16,
                            mr: 0.5
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {tutor.rating.toFixed(1)} ({tutor.totalReviews})
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
