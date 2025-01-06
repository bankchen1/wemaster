import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { AppealStatus } from '@wemaster/shared/types/booking';
import { useAppealStore } from '../../stores/appealStore';

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
      id={`appeal-tabpanel-${index}`}
      aria-labelledby={`appeal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AppealList: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();
  const { appeals, fetchAppeals, loading, error } = useAppealStore();

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const getStatusChip = (status: AppealStatus) => {
    const statusConfig = {
      [AppealStatus.PENDING_TUTOR]: { color: 'warning', label: '等待导师回复' },
      [AppealStatus.PENDING_STUDENT]: { color: 'info', label: '等待确认' },
      [AppealStatus.PENDING_PLATFORM]: { color: 'warning', label: '等待平台处理' },
      [AppealStatus.PLATFORM_PROCESSING]: { color: 'info', label: '平台处理中' },
      [AppealStatus.COMPLETED]: { color: 'success', label: '已完成' },
      [AppealStatus.CANCELLED]: { color: 'error', label: '已取消' },
    };

    const config = statusConfig[status];
    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size="small"
      />
    );
  };

  const renderAppealCard = (appeal: any) => (
    <Card key={appeal.id} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle1" gutterBottom>
              申诉编号：{appeal.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              申诉时间：{format(new Date(appeal.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              申诉原因：{appeal.reason}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            {getStatusChip(appeal.status)}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/student/appeals/${appeal.id}`)}
              >
                查看详情
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const filteredAppeals = {
    active: appeals.filter(a => 
      [
        AppealStatus.PENDING_TUTOR,
        AppealStatus.PENDING_STUDENT,
        AppealStatus.PENDING_PLATFORM,
        AppealStatus.PLATFORM_PROCESSING,
      ].includes(a.status)
    ),
    completed: appeals.filter(a => a.status === AppealStatus.COMPLETED),
    cancelled: appeals.filter(a => a.status === AppealStatus.CANCELLED),
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            我的申诉
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label={`处理中 (${filteredAppeals.active.length})`} />
            <Tab label={`已完成 (${filteredAppeals.completed.length})`} />
            <Tab label={`已取消 (${filteredAppeals.cancelled.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {filteredAppeals.active.map(renderAppealCard)}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {filteredAppeals.completed.map(renderAppealCard)}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {filteredAppeals.cancelled.map(renderAppealCard)}
        </TabPanel>

        {selectedTab === 0 && filteredAppeals.active.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              暂无处理中的申诉
            </Typography>
          </Box>
        )}

        {selectedTab === 1 && filteredAppeals.completed.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              暂无已完成的申诉
            </Typography>
          </Box>
        )}

        {selectedTab === 2 && filteredAppeals.cancelled.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              暂无已取消的申诉
            </Typography>
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            申诉处理流程：
          </Typography>
          <ol>
            <li>提交申诉后，导师将在48小时内回复</li>
            <li>如果您对导师的回复不满意，可以申请平台介入</li>
            <li>平台将在7天内处理您的申诉</li>
            <li>如果申诉成功，将根据具体情况给予退款或补偿</li>
          </ol>
        </Alert>
      </Paper>
    </Container>
  );
};

export default AppealList;
