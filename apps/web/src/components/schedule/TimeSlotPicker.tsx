import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {
  ChevronLeft,
  ChevronRight,
  Event,
  AccessTime,
  Repeat
} from '@mui/icons-material'
import { DateTime } from 'luxon'
import { useTranslation } from 'react-i18next'
import { useTimeSlots } from '../../hooks/useTimeSlots'
import { useTimezone } from '../../hooks/useTimezone'
import { TimeSlot, TimeSlotStatus } from '../../types/schedule'

interface TimeSlotPickerProps {
  tutorId?: string
  selectedDate?: Date
  onSlotSelect: (slot: TimeSlot) => void
  duration?: number
  subjects?: string[]
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  tutorId,
  selectedDate = new Date(),
  onSlotSelect,
  duration,
  subjects
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { timezone, setTimezone } = useTimezone()

  const [currentDate, setCurrentDate] = useState(DateTime.fromJSDate(selectedDate))
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  const {
    slots,
    isLoading,
    error,
    fetchSlots
  } = useTimeSlots({
    tutorId,
    startDate: currentDate.startOf('week').toJSDate(),
    endDate: currentDate.endOf('week').toJSDate(),
    timezone,
    duration,
    subjects
  })

  useEffect(() => {
    fetchSlots()
  }, [currentDate, timezone])

  const handlePreviousWeek = () => {
    setCurrentDate(prev => prev.minus({ weeks: 1 }))
  }

  const handleNextWeek = () => {
    setCurrentDate(prev => prev.plus({ weeks: 1 }))
  }

  const handleDateSelect = (date: DateTime) => {
    setCurrentDate(date)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    onSlotSelect(slot)
  }

  const groupSlotsByDay = (slots: TimeSlot[]) => {
    const grouped = new Map<string, TimeSlot[]>()
    slots.forEach(slot => {
      const day = DateTime.fromJSDate(slot.startTime)
        .setZone(timezone)
        .toFormat('yyyy-MM-dd')
      if (!grouped.has(day)) {
        grouped.set(day, [])
      }
      grouped.get(day)?.push(slot)
    })
    return grouped
  }

  const renderTimeSlot = (slot: TimeSlot) => {
    const startTime = DateTime.fromJSDate(slot.startTime)
      .setZone(timezone)
      .toFormat('HH:mm')
    const endTime = DateTime.fromJSDate(slot.endTime)
      .setZone(timezone)
      .toFormat('HH:mm')
    const isSelected = selectedSlot?.id === slot.id
    const isAvailable = slot.status === TimeSlotStatus.AVAILABLE

    return (
      <Button
        key={slot.id}
        variant={isSelected ? 'contained' : 'outlined'}
        color={isSelected ? 'primary' : 'inherit'}
        disabled={!isAvailable}
        onClick={() => isAvailable && handleSlotSelect(slot)}
        sx={{
          width: '100%',
          justifyContent: 'flex-start',
          mb: 1,
          position: 'relative',
          '&:hover': {
            backgroundColor: isSelected
              ? theme.palette.primary.main
              : theme.palette.action.hover
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <AccessTime sx={{ mr: 1 }} />
          <Typography variant="body2">
            {startTime} - {endTime}
          </Typography>
          {slot.recurrenceType !== 'none' && (
            <Tooltip title={t('schedule.recurring')}>
              <Repeat sx={{ ml: 'auto' }} />
            </Tooltip>
          )}
        </Box>
      </Button>
    )
  }

  const renderDaySlots = (date: DateTime, slots: TimeSlot[]) => {
    const dayStr = date.toFormat('ccc')
    const dateStr = date.toFormat('d')
    const isToday = date.hasSame(DateTime.local(), 'day')

    return (
      <Paper
        key={date.toISO()}
        sx={{
          p: 2,
          height: '100%',
          backgroundColor: isToday
            ? theme.palette.primary.light
            : theme.palette.background.paper
        }}
      >
        <Typography
          variant="subtitle1"
          align="center"
          gutterBottom
          color={isToday ? 'primary' : 'textPrimary'}
        >
          {dayStr}
          <br />
          {dateStr}
        </Typography>
        {slots.length > 0 ? (
          slots.map(renderTimeSlot)
        ) : (
          <Typography variant="body2" color="textSecondary" align="center">
            {t('schedule.noSlots')}
          </Typography>
        )}
      </Paper>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  const groupedSlots = groupSlotsByDay(slots)
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    currentDate.startOf('week').plus({ days: i })
  )

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}
      >
        <IconButton onClick={handlePreviousWeek}>
          <ChevronLeft />
        </IconButton>
        <DatePicker
          value={currentDate.toJSDate()}
          onChange={date =>
            handleDateSelect(DateTime.fromJSDate(date as Date))
          }
          renderInput={params => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ mr: 1 }} />
              <Typography variant="h6">
                {currentDate.toFormat('MMMM yyyy')}
              </Typography>
            </Box>
          )}
        />
        <IconButton onClick={handleNextWeek}>
          <ChevronRight />
        </IconButton>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {weekDays.map(date => (
            <Grid item xs={12} sm={isMobile ? 12 : 'auto'} key={date.toISO()}>
              {renderDaySlots(
                date,
                groupedSlots.get(date.toFormat('yyyy-MM-dd')) || []
              )}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
