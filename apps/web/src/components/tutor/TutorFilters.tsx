import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Slider,
  TextField,
  Autocomplete,
  Chip,
  Button,
  Grid
} from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  TeachingLanguage,
  TutorDegree,
  StudentLevel,
  TutorSearchFilters
} from '@/types/tutor'
import { Subject } from '@/types/subject'
import { useTranslation } from 'react-i18next'

const FilterCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiCardContent-root': {
    padding: theme.spacing(2)
  }
}))

const PriceSlider = styled(Slider)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2)
}))

interface TutorFiltersProps {
  subjects: Subject[]
  onFiltersChange: (filters: TutorSearchFilters) => void
  initialFilters?: Partial<TutorSearchFilters>
}

export const TutorFilters: React.FC<TutorFiltersProps> = ({
  subjects,
  onFiltersChange,
  initialFilters = {}
}) => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<TutorSearchFilters>({
    subjects: [],
    teachingLanguages: [],
    degree: [],
    studentLevels: [],
    priceRange: { min: 0, max: 200 },
    availability: {
      daysOfWeek: [],
      timeRange: { startTime: '09:00', endTime: '21:00' }
    },
    ageRange: { min: 18, max: 65 },
    ...initialFilters
  })

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleSubjectsChange = (event: any, newValue: Subject[]) => {
    setFilters(prev => ({
      ...prev,
      subjects: newValue.map(subject => subject.id)
    }))
  }

  const handleLanguagesChange = (event: any) => {
    setFilters(prev => ({
      ...prev,
      teachingLanguages: event.target.value as TeachingLanguage[]
    }))
  }

  const handleDegreeChange = (event: any) => {
    setFilters(prev => ({
      ...prev,
      degree: event.target.value as TutorDegree[]
    }))
  }

  const handleStudentLevelsChange = (event: any) => {
    setFilters(prev => ({
      ...prev,
      studentLevels: event.target.value as StudentLevel[]
    }))
  }

  const handlePriceRangeChange = (event: any, newValue: number | number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        min: Array.isArray(newValue) ? newValue[0] : 0,
        max: Array.isArray(newValue) ? newValue[1] : newValue
      }
    }))
  }

  const handleAvailabilityChange = (day: number) => {
    setFilters(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        daysOfWeek: prev.availability.daysOfWeek.includes(day)
          ? prev.availability.daysOfWeek.filter(d => d !== day)
          : [...prev.availability.daysOfWeek, day]
      }
    }))
  }

  const handleTimeRangeChange = (type: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeRange: {
          ...prev.availability.timeRange,
          [type === 'start' ? 'startTime' : 'endTime']: value
        }
      }
    }))
  }

  const handleAgeRangeChange = (event: any, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setFilters(prev => ({
        ...prev,
        ageRange: {
          min: newValue[0],
          max: newValue[1]
        }
      }))
    }
  }

  const resetFilters = () => {
    setFilters({
      subjects: [],
      teachingLanguages: [],
      degree: [],
      studentLevels: [],
      priceRange: { min: 0, max: 200 },
      availability: {
        daysOfWeek: [],
        timeRange: { startTime: '09:00', endTime: '21:00' }
      },
      ageRange: { min: 18, max: 65 }
    })
  }

  return (
    <Box>
      <FilterCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('filters.subjects')}
          </Typography>
          <Autocomplete
            multiple
            options={subjects}
            getOptionLabel={(option: Subject) => option.name}
            value={subjects.filter(subject =>
              filters.subjects.includes(subject.id)
            )}
            onChange={handleSubjectsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={t('filters.selectSubjects')}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
          />
        </CardContent>
      </FilterCard>

      <FilterCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('filters.teachingLanguages')}
          </Typography>
          <FormControl fullWidth>
            <Select
              multiple
              value={filters.teachingLanguages}
              onChange={handleLanguagesChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={t(`languages.${value}`)} />
                  ))}
                </Box>
              )}
            >
              {Object.values(TeachingLanguage).map((language) => (
                <MenuItem key={language} value={language}>
                  <Checkbox
                    checked={filters.teachingLanguages.includes(language)}
                  />
                  <ListItemText primary={t(`languages.${language}`)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </FilterCard>

      <FilterCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('filters.priceRange')}
          </Typography>
          <PriceSlider
            value={[filters.priceRange.min, filters.priceRange.max]}
            onChange={handlePriceRangeChange}
            valueLabelDisplay="auto"
            min={0}
            max={200}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              ${filters.priceRange.min}/hour
            </Typography>
            <Typography variant="body2">
              ${filters.priceRange.max}/hour
            </Typography>
          </Box>
        </CardContent>
      </FilterCard>

      <FilterCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('filters.availability')}
          </Typography>
          <Grid container spacing={1}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Grid item key={day}>
                <Chip
                  label={t(`days.${day}`)}
                  onClick={() => handleAvailabilityChange(index)}
                  color={filters.availability.daysOfWeek.includes(index) ? 'primary' : 'default'}
                />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label={t('filters.startTime')}
                  type="time"
                  value={filters.availability.timeRange.startTime}
                  onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t('filters.endTime')}
                  type="time"
                  value={filters.availability.timeRange.endTime}
                  onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </FilterCard>

      <FilterCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('filters.ageRange')}
          </Typography>
          <PriceSlider
            value={[filters.ageRange.min, filters.ageRange.max]}
            onChange={handleAgeRangeChange}
            valueLabelDisplay="auto"
            min={18}
            max={65}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              {filters.ageRange.min} {t('years')}
            </Typography>
            <Typography variant="body2">
              {filters.ageRange.max} {t('years')}
            </Typography>
          </Box>
        </CardContent>
      </FilterCard>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={resetFilters}
          sx={{ mr: 1 }}
        >
          {t('filters.reset')}
        </Button>
        <Button
          variant="contained"
          onClick={() => onFiltersChange(filters)}
        >
          {t('filters.apply')}
        </Button>
      </Box>
    </Box>
  )
}
