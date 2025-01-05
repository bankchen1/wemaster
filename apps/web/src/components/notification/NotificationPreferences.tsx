import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  TextField,
  MenuItem,
  Button,
  Alert,
  Snackbar,
  Grid
} from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { useTranslation } from 'react-i18next'
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences'
import { useTimezone } from '../../hooks/useTimezone'

const notificationTypes = [
  'schedule_reminder',
  'schedule_change',
  'schedule_cancellation',
  'payment_notification',
  'system_announcement',
  'marketing'
]

const channels = ['email', 'push', 'sms']

export const NotificationPreferences: React.FC = () => {
  const { t } = useTranslation()
  const { timezones } = useTimezone()
  const {
    preferences,
    isLoading,
    error,
    updatePreferences
  } = useNotificationPreferences()

  const [localPreferences, setLocalPreferences] = useState(preferences)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences)
    }
  }, [preferences])

  const handleChannelToggle = (type: string, channel: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [channel]: {
          ...prev.preferences[channel],
          [type]: !prev.preferences[channel][type]
        }
      }
    }))
  }

  const handleQuietHoursToggle = () => {
    setLocalPreferences(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        quiet_hours: {
          ...prev.settings.quiet_hours,
          enabled: !prev.settings.quiet_hours.enabled
        }
      }
    }))
  }

  const handleTimeChange = (field: 'start' | 'end', value: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        quiet_hours: {
          ...prev.settings.quiet_hours,
          [field]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    try {
      await updatePreferences(localPreferences)
      setSaveSuccess(true)
      setSaveError(null)
    } catch (err) {
      setSaveError(t('preferences.saveError'))
      setSaveSuccess(false)
    }
  }

  if (isLoading) {
    return <Typography>{t('common.loading')}</Typography>
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('preferences.title')}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('preferences.notificationChannels')}
          </Typography>
          
          <Grid container spacing={3}>
            {notificationTypes.map(type => (
              <Grid item xs={12} key={type}>
                <Typography variant="subtitle1" gutterBottom>
                  {t(`preferences.types.${type}`)}
                </Typography>
                <FormGroup row>
                  {channels.map(channel => (
                    <FormControlLabel
                      key={`${type}-${channel}`}
                      control={
                        <Switch
                          checked={
                            localPreferences?.preferences[channel][type] ?? false
                          }
                          onChange={() => handleChannelToggle(type, channel)}
                        />
                      }
                      label={t(`preferences.channels.${channel}`)}
                    />
                  ))}
                </FormGroup>
                <Divider sx={{ my: 2 }} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('preferences.settings')}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label={t('preferences.timezone')}
                value={localPreferences?.settings.timezone}
                onChange={(e) =>
                  setLocalPreferences(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      timezone: e.target.value
                    }
                  }))
                }
              >
                {timezones.map(tz => (
                  <MenuItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={t('preferences.reminderTime')}
                value={localPreferences?.settings.reminder_before_class}
                onChange={(e) =>
                  setLocalPreferences(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      reminder_before_class: parseInt(e.target.value)
                    }
                  }))
                }
                InputProps={{
                  endAdornment: (
                    <Typography variant="body2" color="textSecondary">
                      {t('common.minutes')}
                    </Typography>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localPreferences?.settings.quiet_hours.enabled}
                    onChange={handleQuietHoursToggle}
                  />
                }
                label={t('preferences.quietHours')}
              />

              {localPreferences?.settings.quiet_hours.enabled && (
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label={t('preferences.quietHoursStart')}
                        value={localPreferences.settings.quiet_hours.start}
                        onChange={(value) =>
                          handleTimeChange('start', value as string)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TimePicker
                        label={t('preferences.quietHoursEnd')}
                        value={localPreferences.settings.quiet_hours.end}
                        onChange={(value) =>
                          handleTimeChange('end', value as string)
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          size="large"
        >
          {t('common.save')}
        </Button>
      </Box>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={() => setSaveSuccess(false)}
      >
        <Alert severity="success">{t('preferences.saveSuccess')}</Alert>
      </Snackbar>

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
      >
        <Alert severity="error">{saveError}</Alert>
      </Snackbar>
    </Box>
  )
}
