import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { usePaymentStore } from '../../stores/paymentStore';

interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  paymentMethod: string;
  createTime: string;
  description: string;
}

const PaymentHistory: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { fetchPaymentHistory, downloadInvoice } = usePaymentStore();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await fetchPaymentHistory();
        setPayments(data);
      } catch (error) {
        console.error('Failed to load payment history:', error);
      }
    };

    loadPayments();
  }, [fetchPaymentHistory]);

  const handleViewDetails = (record: PaymentRecord) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const handleDownloadInvoice = async (recordId: string) => {
    try {
      await downloadInvoice(recordId);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      success: { color: 'success', label: '支付成功' },
      pending: { color: 'warning', label: '处理中' },
      failed: { color: 'error', label: '支付失败' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size="small"
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        支付记录
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>订单号</TableCell>
              <TableCell>金额</TableCell>
              <TableCell>支付方式</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.orderId}</TableCell>
                <TableCell>¥{record.amount.toFixed(2)}</TableCell>
                <TableCell>{record.paymentMethod}</TableCell>
                <TableCell>{getStatusChip(record.status)}</TableCell>
                <TableCell>{record.createTime}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(record)}
                  >
                    <ReceiptIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDownloadInvoice(record.id)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>订单详情</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                订单号: {selectedRecord.orderId}
              </Typography>
              <Typography variant="body1" gutterBottom>
                支付金额: ¥{selectedRecord.amount.toFixed(2)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                支付方式: {selectedRecord.paymentMethod}
              </Typography>
              <Typography variant="body1" gutterBottom>
                支付状态: {getStatusChip(selectedRecord.status)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                支付时间: {selectedRecord.createTime}
              </Typography>
              <Typography variant="body1" gutterBottom>
                描述: {selectedRecord.description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>关闭</Button>
          {selectedRecord && (
            <Button
              onClick={() => handleDownloadInvoice(selectedRecord.id)}
              startIcon={<DownloadIcon />}
            >
              下载发票
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentHistory;
