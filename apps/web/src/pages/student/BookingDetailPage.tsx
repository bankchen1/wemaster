import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BookingStatus, TimeSlot } from '@wemaster/shared/types/booking';
import { useBookingStore } from '../../stores/bookingStore';
import TimeSlotSelector from '../../components/booking/TimeSlotSelector';

const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const {
    currentBooking,
    fetchBookingById,
    cancelBooking,
    requestReschedule,
    loading,
    error,
  } = useBookingStore();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedNewTimeSlot, setSelectedNewTimeSlot] = useState<TimeSlot | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingById(bookingId);
    }
  }, [bookingId, fetchBookingById]);

  const handleCancel = async () => {
    try {
      if (!bookingId || !cancelReason) return;
      await cancelBooking(bookingId, cancelReason);
      setShowCancelDialog(false);
      // 重新加载预约信息
      fetchBookingById(bookingId);
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handleReschedule = async () => {
    try {
      if (!bookingId || !selectedNewTimeSlot || !rescheduleReason) return;
      await requestReschedule(bookingId, {
        timeSlotId: selectedNewTimeSlot.id,
        reason: rescheduleReason,
      });
      setShowRescheduleDialog(false);
      // 重新加载预约信息
      fetchBookingById(bookingId);
    } catch (error) {
      console.error('Failed to request reschedule:', error);
    }
  };

  const canModify = () => {
    if (!currentBooking) return false;
    const hoursTillClass = differenceInHours(
      new Date(currentBooking.timeSlot.startTime),
      new Date()
    );
    return hoursTillClass > 24;
  };

  const getStatusChip = (status: BookingStatus) => {
    const statusConfig = {
      [BookingStatus.PENDING]: { color: 'warning', label: '等待确认' },
      [BookingStatus.CONFIRMED]: { color: 'success', label: '已确认' },
      [BookingStatus.COMPLETED]: { color: 'default', label: '已完成' },
      [BookingStatus.CANCELLED]: { color: 'error', label: '已取消' },
      [BookingStatus.RESCHEDULING]: { color: 'info', label: '改期中' },
      [BookingStatus.APPEALING]: { color: 'warning', label: '申诉中' },
      [BookingStatus.REFUNDED]: { color: 'error', label: '已退款' },
    };

    const config = statusConfig[status];
    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size="small"
      />
    );
  };

  if (!currentBooking) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            预约详情
          </Typography>
          <Chip
            label={getStatusChip(currentBooking.status)}
            sx={{ ml: 1 }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">课程信息</Typography>
            <Typography variant="body1" color="text.secondary">
              {format(new Date(currentBooking.timeSlot.startTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              {' - '}
              {format(new Date(currentBooking.timeSlot.endTime), 'HH:mm', { locale: zhCN })}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1">导师信息</Typography>
            <Typography variant="body1" color="text.secondary">
              {currentBooking.tutorId}
            </Typography>
          </Grid>

          {currentBooking.status === BookingStatus.CANCELLED && (
            <Grid item xs={12}>
              <Alert severity="info">
                取消原因: {currentBooking.cancelReason}
              </Alert>
            </Grid>
          )}

          {currentBooking.status === BookingStatus.RESCHEDULING && (
            <Grid item xs={12}>
              <Alert severity="info">
                改期申请处理中，请等待导师确认。
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {canModify() && currentBooking.status === BookingStatus.CONFIRMED && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowRescheduleDialog(true)}
                  >
                    申请改期
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    取消预约
                  </Button>
                </>
              )}
              {currentBooking.status === BookingStatus.COMPLETED && (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/student/appeals/create/${bookingId}`)}
                >
                  提起申诉
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* 取消预约对话框 */}
        <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
          <DialogTitle>取消预约</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="取消原因"
              fullWidth
              multiline
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCancelDialog(false)}>取消</Button>
            <Button onClick={handleCancel} disabled={!cancelReason}>确认</Button>
          </DialogActions>
        </Dialog>

        {/* 改期对话框 */}
        <Dialog
          open={showRescheduleDialog}
          onClose={() => setShowRescheduleDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>申请改期</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle2" gutterBottom>
              选择新的上课时间
            </Typography>
            {currentBooking && (
              <TimeSlotSelector
                tutorId={currentBooking.tutorId}
                onSelect={setSelectedNewTimeSlot}
                selectedSlot={selectedNewTimeSlot || undefined}
              />
            )}
            <TextField
              margin="dense"
              label="改期原因"
              fullWidth
              multiline
              rows={4}
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRescheduleDialog(false)}>取消</Button>
            <Button
              onClick={handleReschedule}
              disabled={!selectedNewTimeSlot || !rescheduleReason}
            >
              提交
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default BookingDetailPage;
