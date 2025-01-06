import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import { format, startOfWeek, addWeeks } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useBookingStore } from '../../stores/bookingStore';
import ScheduleEditor from '../../components/tutor/schedule/ScheduleEditor';
import TimezoneSelect from '../../components/common/TimezoneSelect';

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
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ScheduleManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [timezone, setTimezone] = useState('');
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const { setTimeSlots, loading, error } = useBookingStore();

  useEffect(() => {
    // 获取用户的时区设置
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
  };

  const handleScheduleChange = async (schedule: any) => {
    try {
      await setTimeSlots(schedule);
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const handleNextWeek = () => {
    setCurrentWeek(date => addWeeks(date, 1));
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(date => addWeeks(date, -1));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            时间管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            设置您的可用时间，学生可以在这些时间段内预约课程。
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TimezoneSelect
              value={timezone}
              onChange={handleTimezoneChange}
              label="时区"
              showLocalTime
            />
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="每周固定时间" />
            <Tab label="自定义时间" />
            <Tab label="休假设置" />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <ScheduleEditor
            timezone={timezone}
            onChange={handleScheduleChange}
            showBookingStatus
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button onClick={handlePreviousWeek}>上一周</Button>
            <Typography sx={{ mx: 2 }}>
              {format(currentWeek, 'yyyy年MM月dd日', { locale: zhCN })} - 
              {format(addWeeks(currentWeek, 1), 'yyyy年MM月dd日', { locale: zhCN })}
            </Typography>
            <Button onClick={handleNextWeek}>下一周</Button>
          </Box>
          <ScheduleEditor
            initialSchedule={{}}
            timezone={timezone}
            onChange={handleScheduleChange}
            showBookingStatus
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Typography variant="body1" paragraph>
            设置休假时间，在休假期间将自动暂停所有预约。
          </Typography>
          {/* 这里添加休假设置组件 */}
        </TabPanel>

        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              注意事项：
            </Typography>
            <ul>
              <li>已被预约的时间段无法取消或修改</li>
              <li>时间设置会根据学生所在时区自动转换</li>
              <li>建议至少提前一周设置可用时间</li>
            </ul>
          </Alert>
        </Box>
      </Paper>
    </Container>
  );
};

export default ScheduleManagement;
