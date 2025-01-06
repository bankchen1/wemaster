import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAlert } from '../../components/alert/AlertProvider';

const Timezone: React.FC = () => {
  const [timezone, setTimezone] = useState('');
  const [timezones, setTimezones] = useState<string[]>([]);
  const { showAlert } = useAlert();
  const { updateSettings } = useSettingsStore();

  useEffect(() => {
    // 获取所有可用时区
    const zones = Intl.supportedValuesOf('timeZone');
    setTimezones(zones);
    
    // 获取当前时区
    const currentZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(currentZone);
  }, []);

  const handleChange = (event: any) => {
    setTimezone(event.target.value);
  };

  const handleSave = async () => {
    try {
      await updateSettings({ timezone });
      showAlert('时区设置已更新', 'success');
    } catch (error) {
      showAlert('更新时区设置失败', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        时区设置
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        选择您所在的时区，以确保所有时间显示正确
      </Alert>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>时区</InputLabel>
        <Select
          value={timezone}
          label="时区"
          onChange={handleChange}
        >
          {timezones.map((zone) => (
            <MenuItem key={zone} value={zone}>
              {zone}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        当前时间：{new Date().toLocaleString(undefined, { timeZone: timezone })}
      </Typography>

      <Button
        variant="contained"
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        保存设置
      </Button>
    </Box>
  );
};

export default Timezone;
