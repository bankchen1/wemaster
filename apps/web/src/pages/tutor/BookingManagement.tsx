import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BookingStatus, Booking } from '@wemaster/shared/types/booking';
import { useBookingStore } from '../../stores/bookingStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BookingManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const {
    bookings,
    fetchBookings,
    confirmBooking,
    rejectBooking,
    respondToReschedule,
    loading,
    error,
  } = useBookingStore();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId);
      fetchBookings();
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectReason) return;

    try {
      await rejectBooking(selectedBooking.id, rejectReason);
      setShowRejectDialog(false);
      setSelectedBooking(null);
      setRejectReason('');
      fetchBookings();
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const handleRespondToReschedule = async (approved: boolean) => {
    if (!selectedBooking) return;

    try {
      await respondToReschedule(selectedBooking.id, approved);
      setShowRescheduleDialog(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Failed to respond to reschedule request:', error);
    }
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

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle1" gutterBottom>
              学生：{booking.studentId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              上课时间：{format(new Date(booking.timeSlot.startTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              课程时长：60分钟
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            {getStatusChip(booking.status)}
            <Box sx={{ mt: 2 }}>
              {booking.status === BookingStatus.PENDING && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleConfirm(booking.id)}
                    sx={{ mr: 1 }}
                  >
                    确认
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowRejectDialog(true);
                    }}
                  >
                    拒绝
                  </Button>
                </>
              )}
              {booking.status === BookingStatus.RESCHEDULING && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowRescheduleDialog(true);
                  }}
                >
                  查看改期申请
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const filteredBookings = {
    pending: bookings.filter(b => b.status === BookingStatus.PENDING),
    upcoming: bookings.filter(b => b.status === BookingStatus.CONFIRMED),
    completed: bookings.filter(b => b.status === BookingStatus.COMPLETED),
    cancelled: bookings.filter(b => 
      [BookingStatus.CANCELLED, BookingStatus.REFUNDED].includes(b.status)
    ),
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          预约管理
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label={`待确认 (${filteredBookings.pending.length})`} />
            <Tab label={`即将开始 (${filteredBookings.upcoming.length})`} />
            <Tab label={`已完成 (${filteredBookings.completed.length})`} />
            <Tab label={`已取消 (${filteredBookings.cancelled.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {filteredBookings.pending.map(renderBookingCard)}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {filteredBookings.upcoming.map(renderBookingCard)}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {filteredBookings.completed.map(renderBookingCard)}
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          {filteredBookings.cancelled.map(renderBookingCard)}
        </TabPanel>

        {/* 拒绝预约对话框 */}
        <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
          <DialogTitle>拒绝预约</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="拒绝原因"
              fullWidth
              multiline
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRejectDialog(false)}>取消</Button>
            <Button onClick={handleReject} disabled={!rejectReason}>
              确认
            </Button>
          </DialogActions>
        </Dialog>

        {/* 改期申请对话框 */}
        <Dialog
          open={showRescheduleDialog}
          onClose={() => setShowRescheduleDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>改期申请</DialogTitle>
          <DialogContent>
            {selectedBooking && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  原上课时间
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {format(new Date(selectedBooking.timeSlot.startTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  申请改期至
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedBooking.originalTimeSlot && 
                    format(new Date(selectedBooking.originalTimeSlot.startTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  改期原因
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedBooking.cancelReason}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRescheduleDialog(false)}>取消</Button>
            <Button
              onClick={() => handleRespondToReschedule(false)}
              color="error"
            >
              拒绝
            </Button>
            <Button
              onClick={() => handleRespondToReschedule(true)}
              color="primary"
              variant="contained"
            >
              同意
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default BookingManagement;
