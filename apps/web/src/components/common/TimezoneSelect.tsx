import React, { useState, useEffect } from 'react'
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  Tooltip,
  CircularProgress
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { DateTime } from 'luxon'

interface TimezoneInfo {
  id: string
  name: string
  offset: string
  abbr: string
  isDST: boolean
}

interface TimezoneSelectProps {
  value: string
  onChange: (timezone: string) => void
  label?: string
  error?: boolean
  helperText?: string
  showLocalTime?: boolean
  fullWidth?: boolean
}

export const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  showLocalTime = true,
  fullWidth = true
}) => {
  const { t } = useTranslation()
  const [timezones, setTimezones] = useState<TimezoneInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [localTime, setLocalTime] = useState<string>('')

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const response = await fetch('/api/timezones')
        const data = await response.json()
        setTimezones(data)
      } catch (error) {
        console.error('Failed to fetch timezones:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTimezones()
  }, [])

  useEffect(() => {
    if (value && showLocalTime) {
      const updateLocalTime = () => {
        const time = DateTime.now().setZone(value)
        setLocalTime(time.toFormat('yyyy-MM-dd HH:mm:ss'))
      }

      updateLocalTime()
      const interval = setInterval(updateLocalTime, 1000)

      return () => clearInterval(interval)
    }
  }, [value, showLocalTime])

  const handleChange = (event: any, newValue: TimezoneInfo | null) => {
    if (newValue) {
      onChange(newValue.id)
    }
  }

  const getOptionLabel = (option: TimezoneInfo) => {
    return `${option.name} (${option.offset})`
  }

  const renderOption = (props: any, option: TimezoneInfo) => (
    <Box component="li" {...props}>
      <Tooltip
        title={
          <React.Fragment>
            <Typography variant="body2">
              {t('timezone.abbreviation')}: {option.abbr}
            </Typography>
            {option.isDST && (
              <Typography variant="body2">
                {t('timezone.daylightSaving')}
              </Typography>
            )}
          </React.Fragment>
        }
      >
        <Box>
          <Typography variant="body1">{option.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {option.offset}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  )

  const selectedTimezone = timezones.find(tz => tz.id === value)

  return (
    <Box>
      <Autocomplete
        value={selectedTimezone}
        onChange={handleChange}
        options={timezones}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        loading={loading}
        fullWidth={fullWidth}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label || t('timezone.select')}
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              )
            }}
          />
        )}
      />
      {showLocalTime && localTime && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('timezone.localTime')}: {localTime}
        </Typography>
      )}
    </Box>
  )
}
