import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  IconButton,
  Collapse,
  Stack,
  Switch,
  FormControlLabel,
  Autocomplete,
  useTheme
} from '@mui/material'
import {
  FilterList,
  Clear,
  DateRange,
  GetApp,
  Schedule
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format } from 'date-fns'

interface ReviewFilterProps {
  onFilterChange: (filter: any) => void
  onExport: (type: 'excel' | 'pdf') => void
  availableTags: string[]
}

export const ReviewFilter: React.FC<ReviewFilterProps> = ({
  onFilterChange,
  onExport,
  availableTags
}) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState({
    startDate: null,
    endDate: null,
    minRating: '',
    maxRating: '',
    tags: [],
    hasReply: null,
    isAnonymous: null
  })

  const handleFilterChange = (field: string, value: any) => {
    const newFilter = { ...filter, [field]: value }
    setFilter(newFilter)
    onFilterChange(newFilter)
  }

  const handleClearFilter = () => {
    const clearedFilter = {
      startDate: null,
      endDate: null,
      minRating: '',
      maxRating: '',
      tags: [],
      hasReply: null,
      isAnonymous: null
    }
    setFilter(clearedFilter)
    onFilterChange(clearedFilter)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filter.startDate) count++
    if (filter.endDate) count++
    if (filter.minRating) count++
    if (filter.maxRating) count++
    if (filter.tags.length > 0) count++
    if (filter.hasReply !== null) count++
    if (filter.isAnonymous !== null) count++
    return count
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: expanded ? 2 : 0
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: theme.transitions.create('transform')
              }}
            >
              <FilterList />
            </IconButton>
            <Typography variant="h6">
              {t('review.filter.title')}
            </Typography>
            {getActiveFilterCount() > 0 && (
              <Chip
                label={getActiveFilterCount()}
                size="small"
                color="primary"
              />
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<GetApp />}
              onClick={() => onExport('excel')}
            >
              {t('review.export.excel')}
            </Button>
            <Button
              size="small"
              startIcon={<GetApp />}
              onClick={() => onExport('pdf')}
            >
              {t('review.export.pdf')}
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={handleClearFilter}
              >
                {t('review.filter.clear')}
              </Button>
            )}
          </Stack>
        </Box>

        <Collapse in={expanded}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <DatePicker
                  label={t('review.filter.startDate')}
                  value={filter.startDate}
                  onChange={date =>
                    handleFilterChange('startDate', date)
                  }
                  renderInput={params => <TextField {...params} />}
                />
                <DatePicker
                  label={t('review.filter.endDate')}
                  value={filter.endDate}
                  onChange={date =>
                    handleFilterChange('endDate', date)
                  }
                  renderInput={params => <TextField {...params} />}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>
                    {t('review.filter.minRating')}
                  </InputLabel>
                  <Select
                    value={filter.minRating}
                    onChange={e =>
                      handleFilterChange('minRating', e.target.value)
                    }
                    label={t('review.filter.minRating')}
                  >
                    <MenuItem value="">
                      {t('review.filter.any')}
                    </MenuItem>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <MenuItem key={rating} value={rating}>
                        {rating}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>
                    {t('review.filter.maxRating')}
                  </InputLabel>
                  <Select
                    value={filter.maxRating}
                    onChange={e =>
                      handleFilterChange('maxRating', e.target.value)
                    }
                    label={t('review.filter.maxRating')}
                  >
                    <MenuItem value="">
                      {t('review.filter.any')}
                    </MenuItem>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <MenuItem key={rating} value={rating}>
                        {rating}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={availableTags}
                value={filter.tags}
                onChange={(_, newValue) =>
                  handleFilterChange('tags', newValue)
                }
                renderInput={params => (
                  <TextField
                    {...params}
                    label={t('review.filter.tags')}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      size="small"
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Stack
                direction="row"
                spacing={3}
                justifyContent="space-between"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={filter.hasReply === true}
                      onChange={e =>
                        handleFilterChange(
                          'hasReply',
                          e.target.checked ? true : null
                        )
                      }
                    />
                  }
                  label={t('review.filter.hasReply')}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={filter.isAnonymous === true}
                      onChange={e =>
                        handleFilterChange(
                          'isAnonymous',
                          e.target.checked ? true : null
                        )
                      }
                    />
                  }
                  label={t('review.filter.anonymous')}
                />
              </Stack>
            </Grid>
          </Grid>
        </Collapse>

        {expanded && getActiveFilterCount() > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('review.filter.activeFilters')}:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {filter.startDate && (
                <Chip
                  size="small"
                  label={`${t('review.filter.from')} ${format(
                    filter.startDate,
                    'yyyy-MM-dd'
                  )}`}
                  onDelete={() =>
                    handleFilterChange('startDate', null)
                  }
                />
              )}
              {filter.endDate && (
                <Chip
                  size="small"
                  label={`${t('review.filter.to')} ${format(
                    filter.endDate,
                    'yyyy-MM-dd'
                  )}`}
                  onDelete={() => handleFilterChange('endDate', null)}
                />
              )}
              {filter.minRating && (
                <Chip
                  size="small"
                  label={`${t('review.filter.minRating')}: ${
                    filter.minRating
                  }`}
                  onDelete={() =>
                    handleFilterChange('minRating', '')
                  }
                />
              )}
              {filter.maxRating && (
                <Chip
                  size="small"
                  label={`${t('review.filter.maxRating')}: ${
                    filter.maxRating
                  }`}
                  onDelete={() =>
                    handleFilterChange('maxRating', '')
                  }
                />
              )}
              {filter.tags.map(tag => (
                <Chip
                  key={tag}
                  size="small"
                  label={tag}
                  onDelete={() =>
                    handleFilterChange(
                      'tags',
                      filter.tags.filter(t => t !== tag)
                    )
                  }
                />
              ))}
              {filter.hasReply === true && (
                <Chip
                  size="small"
                  label={t('review.filter.hasReply')}
                  onDelete={() =>
                    handleFilterChange('hasReply', null)
                  }
                />
              )}
              {filter.isAnonymous === true && (
                <Chip
                  size="small"
                  label={t('review.filter.anonymous')}
                  onDelete={() =>
                    handleFilterChange('isAnonymous', null)
                  }
                />
              )}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
