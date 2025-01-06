import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePaymentStore } from '../../stores/paymentStore';

const steps = ['确认订单', '选择支付方式', '完成支付'];

const PaymentCheckout: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const location = useLocation();
  const navigate = useNavigate();
  const { createOrder, processPayment } = usePaymentStore();
  const selectedPlan = location.state?.plan;

  const handleNext = async () => {
    if (activeStep === 0) {
      // 创建订单
      try {
        await createOrder({
          planName: selectedPlan,
          paymentMethod,
        });
        setActiveStep((prev) => prev + 1);
      } catch (error) {
        console.error('Failed to create order:', error);
      }
    } else if (activeStep === 1) {
      // 处理支付
      try {
        await processPayment(paymentMethod);
        setActiveStep((prev) => prev + 1);
      } catch (error) {
        console.error('Payment failed:', error);
      }
    } else {
      navigate('/payment/history');
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              订单详情
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      选择的套餐: {selectedPlan}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      费用明细
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      套餐费用: ¥199.00
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      优惠金额: -¥20.00
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">
                      应付金额: ¥179.00
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              选择支付方式
            </Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">支付方式</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="alipay"
                  control={<Radio />}
                  label="支付宝"
                />
                <FormControlLabel
                  value="wechat"
                  control={<Radio />}
                  label="微信支付"
                />
                <FormControlLabel
                  value="creditcard"
                  control={<Radio />}
                  label="信用卡"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              支付完成
            </Typography>
            <Typography variant="body1" color="text.secondary">
              感谢您的购买！您可以在订单历史中查看详情
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        {activeStep !== 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            返回
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
        >
          {activeStep === steps.length - 1 ? '完成' : '下一步'}
        </Button>
      </Box>
    </Container>
  );
};

export default PaymentCheckout;
