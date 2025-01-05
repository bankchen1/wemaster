import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Button,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Skeleton,
  useTheme
} from '@mui/material'
import {
  ThumbUp,
  ThumbUpOutlined,
  Reply,
  Edit,
  Delete
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useReviews } from '../../hooks/useReviews'
import { Review } from '../../types/review'
import { formatDistance } from 'date-fns'
import { ConfirmDialog } from '../common/ConfirmDialog'

interface ReviewListProps {
  tutorId: string
}

export const ReviewList: React.FC<ReviewListProps> = ({ tutorId }) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent')
  const [minRating, setMinRating] = useState<number | ''>('')
  const [replyText, setReplyText] = useState('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [page, setPage] = useState(0)
  const pageSize = 10

  const {
    reviews,
    total,
    loading,
    error,
    markHelpful,
    addReply,
    deleteReview,
    refetch
  } = useReviews(tutorId, {
    sortBy,
    minRating: minRating || undefined,
    limit: pageSize,
    offset: page * pageSize
  })

  const handleSortChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setSortBy(event.target.value as typeof sortBy)
    setPage(0)
  }

  const handleRatingFilter = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setMinRating(event.target.value as number | '')
    setPage(0)
  }

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      await markHelpful(reviewId)
    } catch (error) {
      console.error('Failed to mark review as helpful:', error)
    }
  }

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return

    try {
      await addReply(reviewId, replyText)
      setReplyText('')
      setSelectedReview(null)
    } catch (error) {
      console.error('Failed to add reply:', error)
    }
  }

  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedReview) return

    try {
      await deleteReview(selectedReview.id)
      setConfirmDialogOpen(false)
      setSelectedReview(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  const renderReviewSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ ml: 2 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </Box>
        </Box>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </CardContent>
    </Card>
  )

  if (error) {
    return (
      <Typography color="error">
        {t('review.error.loading')}
      </Typography>
    )
  }

  return (
    <Box>
      {/* 筛选器 */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3 }}
        alignItems="center"
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('review.sort.label')}</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            label={t('review.sort.label')}
          >
            <MenuItem value="recent">{t('review.sort.recent')}</MenuItem>
            <MenuItem value="rating">{t('review.sort.rating')}</MenuItem>
            <MenuItem value="helpful">{t('review.sort.helpful')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('review.filter.rating')}</InputLabel>
          <Select
            value={minRating}
            onChange={handleRatingFilter}
            label={t('review.filter.rating')}
          >
            <MenuItem value="">{t('review.filter.all')}</MenuItem>
            <MenuItem value={5}>5 {t('review.stars')}</MenuItem>
            <MenuItem value={4}>4+ {t('review.stars')}</MenuItem>
            <MenuItem value={3}>3+ {t('review.stars')}</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* 评价列表 */}
      {loading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <React.Fragment key={index}>
            {renderReviewSkeleton()}
          </React.Fragment>
        ))
      ) : (
        <Stack spacing={2}>
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={review.user.avatarUrl}
                      alt={review.isAnonymous ? 'Anonymous' : review.user.fullName}
                    />
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="subtitle1">
                        {review.isAnonymous
                          ? t('review.anonymous')
                          : review.user.fullName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatDistance(
                          new Date(review.createdAt),
                          new Date(),
                          { addSuffix: true }
                        )}
                        {review.isEdited && (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            ({t('review.edited')})
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                    />
                    {user?.id === review.userId && (
                      <Box sx={{ ml: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(review)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.content}
                </Typography>

                {review.tags && review.tags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {review.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5 }}
                      />
                    ))}
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Button
                    size="small"
                    startIcon={
                      review.helpfulUsers?.includes(user?.id || '')
                        ? <ThumbUp />
                        : <ThumbUpOutlined />
                    }
                    onClick={() => handleHelpfulClick(review.id)}
                    disabled={!user || review.userId === user.id}
                  >
                    {t('review.helpful')} ({review.helpfulCount})
                  </Button>

                  {user?.id === review.tutorId && !review.tutorReply && (
                    <Button
                      size="small"
                      startIcon={<Reply />}
                      onClick={() => setSelectedReview(review)}
                    >
                      {t('review.reply')}
                    </Button>
                  )}
                </Box>

                {review.tutorReply && (
                  <Box sx={{ mt: 2, pl: 2, borderLeft: 1, borderColor: 'divider' }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      {t('review.tutorReply')}
                    </Typography>
                    <Typography variant="body2">
                      {review.tutorReply}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatDistance(
                        new Date(review.tutorReplyAt!),
                        new Date(),
                        { addSuffix: true }
                      )}
                    </Typography>
                  </Box>
                )}

                {selectedReview?.id === review.id && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={t('review.replyPlaceholder')}
                      size="small"
                    />
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        onClick={() => setSelectedReview(null)}
                        sx={{ mr: 1 }}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleReplySubmit(review.id)}
                        disabled={!replyText.trim()}
                      >
                        {t('common.submit')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* 分页 */}
      {total > pageSize && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3
          }}
        >
          <Button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            sx={{ mr: 1 }}
          >
            {t('common.previous')}
          </Button>
          <Button
            disabled={(page + 1) * pageSize >= total}
            onClick={() => setPage(p => p + 1)}
          >
            {t('common.next')}
          </Button>
        </Box>
      )}

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title={t('review.delete.title')}
        content={t('review.delete.content')}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmDialogOpen(false)
          setSelectedReview(null)
        }}
      />
    </Box>
  )
}
