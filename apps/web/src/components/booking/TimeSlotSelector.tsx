import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TimeSlot } from '@wemaster/shared/types/booking';
import { useBookingStore } from '../../stores/bookingStore';

interface TimeSlotSelectorProps {
  tutorId: string;
  onSelect: (timeSlot: TimeSlot) => void;
  selectedSlot?: TimeSlot;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  tutorId,
  onSelect,
  selectedSlot,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const { fetchTimeSlots } = useBookingStore();

  // 生成一周的日期
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    const loadTimeSlots = async () => {
      const startDate = currentWeekStart;
      const endDate = addDays(startDate, 7);
      const slots = await fetchTimeSlots(tutorId, startDate, endDate);
      setTimeSlots(slots);
    };

    loadTimeSlots();
  }, [tutorId, currentWeekStart, fetchTimeSlots]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(date => addDays(date, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(date => addDays(date, 7));
  };

  // 按日期和时间对时间段进行分组
  const groupedTimeSlots = timeSlots.reduce((acc, slot) => {
    const date = format(new Date(slot.startTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlot?.id === slot.id;
  };

  const isSlotAvailable = (slot: TimeSlot) => {
    return !slot.isBooked && new Date(slot.startTime) > new Date();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handlePreviousWeek}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
          {format(currentWeekStart, 'yyyy年MM月dd日', { locale: zhCN })} - 
          {format(addDays(currentWeekStart, 6), 'yyyy年MM月dd日', { locale: zhCN })}
        </Typography>
        <IconButton onClick={handleNextWeek}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {weekDays.map(day => (
          <Grid item xs key={day.toISOString()}>
            <Typography
              variant="subtitle2"
              align="center"
              sx={{
                mb: 1,
                fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
              }}
            >
              {format(day, 'E', { locale: zhCN })}
              <br />
              {format(day, 'MM/dd')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {groupedTimeSlots[format(day, 'yyyy-MM-dd')]?.map(slot => (
                <Tooltip
                  key={slot.id}
                  title={slot.isBooked ? '该时段已被预约' : ''}
                >
                  <span>
                    <Button
                      variant={isSlotSelected(slot) ? 'contained' : 'outlined'}
                      size="small"
                      fullWidth
                      disabled={!isSlotAvailable(slot)}
                      onClick={() => onSelect(slot)}
                      sx={{
                        minHeight: '36px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {format(new Date(slot.startTime), 'HH:mm')}
                    </Button>
                  </span>
                </Tooltip>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TimeSlotSelector;
