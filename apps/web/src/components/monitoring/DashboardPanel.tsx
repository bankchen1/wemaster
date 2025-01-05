import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Refresh, Warning } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useMonitoring } from '../../hooks/useMonitoring'
import { formatNumber, formatDuration } from '../../utils/format'

interface MetricCardProps {
  title: string
  value: number | string
  unit?: string
  change?: number
  status?: 'success' | 'warning' | 'error'
  loading?: boolean
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  status = 'success',
  loading = false
}) => {
  const theme = useTheme()

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return theme.palette.success.main
      case 'warning':
        return theme.palette.warning.main
      case 'error':
        return theme.palette.error.main
      default:
        return theme.palette.text.primary
    }
  }

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Typography
              variant="h4"
              component="div"
              sx={{ color: getStatusColor() }}
            >
              {value}
              {unit && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ ml: 0.5, color: 'text.secondary' }}
                >
                  {unit}
                </Typography>
              )}
            </Typography>
            {change !== undefined && (
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color:
                    change > 0
                      ? theme.palette.success.main
                      : theme.palette.error.main
                }}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </Typography>
            )}
          </>
        )}
      </Box>
      {status === 'warning' && (
        <Warning
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: theme.palette.warning.main
          }}
        />
      )}
    </Paper>
  )
}

export const DashboardPanel: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [refreshKey, setRefreshKey] = useState(0)

  const {
    metrics,
    alerts,
    isLoading,
    error,
    refresh
  } = useMonitoring()

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1)
    }, 30000) // 每30秒刷新一次

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    refresh()
  }, [refreshKey])

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  const scheduleMetrics = metrics?.schedule || {}
  const apiMetrics = metrics?.api || {}
  const cacheMetrics = metrics?.cache || {}
  const systemMetrics = metrics?.system || {}

  const getMetricStatus = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return 'error'
    if (value >= thresholds.warning) return 'warning'
    return 'success'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h5">{t('monitoring.dashboard.title')}</Typography>
        <IconButton onClick={refresh} disabled={isLoading}>
          <Refresh />
        </IconButton>
      </Box>

      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              severity={alert.severity}
              sx={{ mb: 1 }}
              action={
                <Tooltip title={t('monitoring.alerts.acknowledge')}>
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => {
                      // Handle alert acknowledgment
                    }}
                  >
                    <Warning />
                  </IconButton>
                </Tooltip>
              }
            >
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* 预约系统指标 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('monitoring.schedule.title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={t('monitoring.schedule.slotsCreated')}
                value={formatNumber(scheduleMetrics.slotsCreated)}
                loading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={t('monitoring.schedule.slotsBooked')}
                value={formatNumber(scheduleMetrics.slotsBooked)}
                loading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={t('monitoring.schedule.bookingDuration')}
                value={formatDuration(scheduleMetrics.bookingDuration)}
                unit="ms"
                status={getMetricStatus(scheduleMetrics.bookingDuration, {
                  warning: 1000,
                  error: 3000
                })}
                loading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={t('monitoring.schedule.conflicts')}
                value={formatNumber(scheduleMetrics.conflicts)}
                status={getMetricStatus(scheduleMetrics.conflicts, {
                  warning: 10,
                  error: 50
                })}
                loading={isLoading}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* API性能指标 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('monitoring.api.title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('monitoring.api.requestDuration')}
                </Typography>
                <ResponsiveContainer>
                  <LineChart data={apiMetrics.requestDurationHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke={theme.palette.primary.main}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MetricCard
                    title={t('monitoring.api.requestCount')}
                    value={formatNumber(apiMetrics.requestCount)}
                    loading={isLoading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MetricCard
                    title={t('monitoring.api.errorRate')}
                    value={formatNumber(apiMetrics.errorRate)}
                    unit="%"
                    status={getMetricStatus(apiMetrics.errorRate, {
                      warning: 5,
                      error: 10
                    })}
                    loading={isLoading}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* 缓存性能指标 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('monitoring.cache.title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 300 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('monitoring.cache.hitRate')}
                </Typography>
                <ResponsiveContainer>
                  <BarChart data={cacheMetrics.hitRateHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar
                      dataKey="hitRate"
                      fill={theme.palette.primary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <MetricCard
                    title={t('monitoring.cache.hitCount')}
                    value={formatNumber(cacheMetrics.hitCount)}
                    loading={isLoading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MetricCard
                    title={t('monitoring.cache.missCount')}
                    value={formatNumber(cacheMetrics.missCount)}
                    loading={isLoading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MetricCard
                    title={t('monitoring.cache.errorCount')}
                    value={formatNumber(cacheMetrics.errorCount)}
                    status={getMetricStatus(cacheMetrics.errorCount, {
                      warning: 100,
                      error: 500
                    })}
                    loading={isLoading}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* 系统资源指标 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('monitoring.system.title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title={t('monitoring.system.cpuUsage')}
                value={formatNumber(systemMetrics.cpuUsage)}
                unit="%"
                status={getMetricStatus(systemMetrics.cpuUsage, {
                  warning: 70,
                  error: 90
                })}
                loading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title={t('monitoring.system.memoryUsage')}
                value={formatNumber(systemMetrics.memoryUsage / 1024 / 1024)}
                unit="MB"
                status={getMetricStatus(systemMetrics.memoryUsage / 1024 / 1024, {
                  warning: 1024,
                  error: 2048
                })}
                loading={isLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title={t('monitoring.system.activeConnections')}
                value={formatNumber(systemMetrics.activeConnections)}
                status={getMetricStatus(systemMetrics.activeConnections, {
                  warning: 1000,
                  error: 5000
                })}
                loading={isLoading}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
