import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { AppealStatus } from '@wemaster/shared/types/booking';
import { useAppealStore } from '../../stores/appealStore';
import { useAuth } from '../../hooks/useAuth';

const steps = [
  '提交申诉',
  '导师回复',
  '学生确认',
  '平台处理',
  '完成'
];

const AppealDetail: React.FC = () => {
  const { appealId } = useParams<{ appealId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPlatformDialog, setShowPlatformDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const {
    currentAppeal,
    fetchAppealById,
    confirmTutorResponse,
    loading,
    error,
  } = useAppealStore();

  useEffect(() => {
    if (appealId) {
      fetchAppealById(appealId);
    }
  }, [appealId, fetchAppealById]);

  const getActiveStep = (status: AppealStatus) => {
    switch (status) {
      case AppealStatus.PENDING_TUTOR:
        return 1;
      case AppealStatus.PENDING_STUDENT:
        return 2;
      case AppealStatus.PENDING_PLATFORM:
      case AppealStatus.PLATFORM_PROCESSING:
        return 3;
      case AppealStatus.COMPLETED:
        return 4;
      default:
        return 0;
    }
  };

  const handleConfirmResponse = async (accept: boolean) => {
    if (!appealId) return;

    try {
      if (accept) {
        await confirmTutorResponse(appealId, true);
      } else {
        if (!rejectReason) return;
        await confirmTutorResponse(appealId, false);
        setShowPlatformDialog(true);
      }
      setShowConfirmDialog(false);
      setRejectReason('');
      fetchAppealById(appealId);
    } catch (error) {
      console.error('Failed to confirm response:', error);
    }
  };

  if (!currentAppeal) {
    return null;
  }

  const isStudent = user?.id === currentAppeal.studentId;
  const isTutor = user?.id === currentAppeal.tutorId;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          申诉详情
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={getActiveStep(currentAppeal.status)} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  申诉信息
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      申诉时间：
                      {format(new Date(currentAppeal.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      申诉状态：{currentAppeal.status}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      申诉原因：{currentAppeal.reason}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      申诉内容：{currentAppeal.content}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {currentAppeal.tutorResponse && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    导师回复
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentAppeal.tutorResponse}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {currentAppeal.platformResponse && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    平台处理结果
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentAppeal.platformResponse}
                  </Typography>
                  {currentAppeal.refundAmount && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      退款金额：¥{currentAppeal.refundAmount}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {currentAppeal.status === AppealStatus.PENDING_STUDENT && isStudent && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setShowConfirmDialog(true)}
                >
                  确认导师回复
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* 确认回复对话框 */}
        <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
          <DialogTitle>确认导师回复</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              您是否接受导师的回复？
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="如不接受，请说明原因"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmDialog(false)}>取消</Button>
            <Button
              onClick={() => handleConfirmResponse(false)}
              color="error"
              disabled={!rejectReason}
            >
              不接受
            </Button>
            <Button
              onClick={() => handleConfirmResponse(true)}
              color="primary"
              variant="contained"
            >
              接受
            </Button>
          </DialogActions>
        </Dialog>

        {/* 平台介入对话框 */}
        <Dialog
          open={showPlatformDialog}
          onClose={() => setShowPlatformDialog(false)}
        >
          <DialogTitle>申请平台介入</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              您的申请已提交，平台将在7天内处理您的申诉。
              您可以随时在申诉详情页查看处理进度。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowPlatformDialog(false);
                navigate('/student/appeals');
              }}
            >
              确定
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default AppealDetail;
