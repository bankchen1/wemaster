import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  TextField,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Delete, Add } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { DateTime } from 'luxon'
import { RecurrenceType } from '../../types/schedule'

interface RecurrenceSettingsProps {
  value: {
    type: RecurrenceType
    endDate?: Date
    daysOfWeek: number[]
    excludeDates: string[]
  }
  onChange: (settings: RecurrenceSettingsProps['value']) => void
  minDate?: Date
  maxDate?: Date
}

export const RecurrenceSettings: React.FC<RecurrenceSettingsProps> = ({
  value,
  onChange,
  minDate = new Date(),
  maxDate
}) => {
  const { t } = useTranslation()
  const [showExcludeDialog, setShowExcludeDialog] = useState(false)
  const [excludeDate, setExcludeDate] = useState<Date | null>(null)

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      type: event.target.value as RecurrenceType
    })
  }

  const handleEndDateChange = (date: Date | null) => {
    onChange({
      ...value,
      endDate: date || undefined
    })
  }

  const handleDayToggle = (day: number) => {
    const newDays = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter(d => d !== day)
      : [...value.daysOfWeek, day]
    onChange({
      ...value,
      daysOfWeek: newDays
    })
  }

  const handleAddExcludeDate = () => {
    if (excludeDate) {
      const dateStr = DateTime.fromJSDate(excludeDate).toFormat('yyyy-MM-dd')
      if (!value.excludeDates.includes(dateStr)) {
        onChange({
          ...value,
          excludeDates: [...value.excludeDates, dateStr]
        })
      }
      setExcludeDate(null)
      setShowExcludeDialog(false)
    }
  }

  const handleRemoveExcludeDate = (dateStr: string) => {
    onChange({
      ...value,
      excludeDates: value.excludeDates.filter(d => d !== dateStr)
    })
  }

  const weekDays = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ]

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('schedule.recurrence.title')}
        </Typography>

        <FormControl component="fieldset">
          <RadioGroup value={value.type} onChange={handleTypeChange}>
            <FormControlLabel
              value={RecurrenceType.NONE}
              control={<Radio />}
              label={t('schedule.recurrence.none')}
            />
            <FormControlLabel
              value={RecurrenceType.DAILY}
              control={<Radio />}
              label={t('schedule.recurrence.daily')}
            />
            <FormControlLabel
              value={RecurrenceType.WEEKLY}
              control={<Radio />}
              label={t('schedule.recurrence.weekly')}
            />
            <FormControlLabel
              value={RecurrenceType.BIWEEKLY}
              control={<Radio />}
              label={t('schedule.recurrence.biweekly')}
            />
            <FormControlLabel
              value={RecurrenceType.MONTHLY}
              control={<Radio />}
              label={t('schedule.recurrence.monthly')}
            />
          </RadioGroup>
        </FormControl>

        {value.type !== RecurrenceType.NONE && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('schedule.recurrence.endDate')}
            </Typography>
            <DatePicker
              value={value.endDate || null}
              onChange={handleEndDateChange}
              minDate={minDate}
              maxDate={maxDate}
              renderInput={params => <TextField {...params} />}
            />
          </Box>
        )}

        {(value.type === RecurrenceType.WEEKLY ||
          value.type === RecurrenceType.BIWEEKLY) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('schedule.recurrence.selectDays')}
            </Typography>
            <Grid container spacing={1}>
              {weekDays.map((day, index) => (
                <Grid item key={day}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value.daysOfWeek.includes(index + 1)}
                        onChange={() => handleDayToggle(index + 1)}
                      />
                    }
                    label={t(`schedule.days.${day}`)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              {t('schedule.recurrence.excludeDates')}
            </Typography>
            <Button
              startIcon={<Add />}
              onClick={() => setShowExcludeDialog(true)}
              sx={{ ml: 2 }}
            >
              {t('schedule.recurrence.addDate')}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {value.excludeDates.map(date => (
              <Chip
                key={date}
                label={DateTime.fromFormat(date, 'yyyy-MM-dd').toFormat(
                  'dd LLL yyyy'
                )}
                onDelete={() => handleRemoveExcludeDate(date)}
                deleteIcon={<Delete />}
              />
            ))}
          </Box>
        </Box>

        <Dialog
          open={showExcludeDialog}
          onClose={() => setShowExcludeDialog(false)}
        >
          <DialogTitle>{t('schedule.recurrence.selectExcludeDate')}</DialogTitle>
          <DialogContent>
            <DatePicker
              value={excludeDate}
              onChange={setExcludeDate}
              minDate={minDate}
              maxDate={maxDate}
              renderInput={params => <TextField {...params} fullWidth />}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExcludeDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddExcludeDate}
              color="primary"
              disabled={!excludeDate}
            >
              {t('common.add')}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}
