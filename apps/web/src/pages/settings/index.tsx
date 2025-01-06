import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import Profile from './Profile';
import Notification from './Notification';
import Security from './Security';
import Timezone from './Timezone';

const Settings: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
          <Tab label="个人资料" />
          <Tab label="通知设置" />
          <Tab label="安全设置" />
          <Tab label="时区设置" />
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        {value === 0 && <Profile />}
        {value === 1 && <Notification />}
        {value === 2 && <Security />}
        {value === 3 && <Timezone />}
      </Box>
    </Box>
  );
};

export default Settings;
