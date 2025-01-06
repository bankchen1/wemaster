import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAppealStore } from '../../stores/appealStore';
import { useBookingStore } from '../../stores/bookingStore';

const AppealCreate: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const { createAppeal, loading, error } = useAppealStore();
  const { currentBooking, fetchBookingById } = useBookingStore();

  useEffect(() => {
    if (bookingId) {
      fetchBookingById(bookingId);
    }
  }, [bookingId, fetchBookingById]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!bookingId) return;

    try {
      await createAppeal(bookingId, {
        reason,
        content,
        evidence: files,
      });
      navigate('/student/appeals');
    } catch (error) {
      console.error('Failed to create appeal:', error);
    }
  };

  if (!currentBooking) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          提起申诉
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                课程信息
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    上课时间：
                    {format(new Date(currentBooking.timeSlot.startTime), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    导师：{currentBooking.tutorId}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            申诉原因
          </Typography>
          <TextField
            fullWidth
            select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">请选择申诉原因</option>
            <option value="quality">课程质量问题</option>
            <option value="attitude">服务态度问题</option>
            <option value="technical">技术问题</option>
            <option value="other">其他问题</option>
          </TextField>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            申诉内容
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请详细描述您遇到的问题..."
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            上传证据
          </Typography>
          <input
            accept="image/*,video/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="upload-file"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="upload-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              选择文件
            </Button>
          </label>

          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            申诉须知：
          </Typography>
          <ul>
            <li>申诉需在课程结束后24小时内提交</li>
            <li>请提供充分的证据支持您的申诉</li>
            <li>导师将在48小时内回复您的申诉</li>
            <li>如对导师的回复不满意，可以申请平台介入</li>
          </ul>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!reason || !content || loading}
          >
            提交申诉
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            取消
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AppealCreate;
