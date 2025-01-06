import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  useTheme,
  styled,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Email as EmailIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { purchaseGiftCard, selectGiftCardLoading } from '@/store/giftCardSlice';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
    zIndex: 0,
  },
}));

const PaymentMethod = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const steps = ['Select Amount', 'Recipient Details', 'Payment', 'Confirmation'];

export const GiftCardPurchase: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const loading = useSelector(selectGiftCardLoading);

  const [activeStep, setActiveStep] = useState(0);
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleNext = () => {
    if (activeStep === steps.length - 2) {
      handlePurchase();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePurchase = async () => {
    await dispatch(purchaseGiftCard({
      amount: amount || Number(customAmount),
      recipientEmail,
      message,
    }));
    setActiveStep(steps.length - 1);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Choose Gift Card Amount
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {[25, 50, 100, 200, 500].map((value) => (
                    <Grid item key={value}>
                      <Button
                        variant={amount === value ? 'contained' : 'outlined'}
                        onClick={() => {
                          setAmount(value);
                          setCustomAmount('');
                        }}
                        sx={{ minWidth: 100 }}
                      >
                        ${value}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Custom Amount"
                  value={customAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && Number(value) <= 1000) {
                      setCustomAmount(value);
                      setAmount(0);
                    }
                  }}
                  fullWidth
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Recipient Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Recipient's Email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Personal Message (Optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Payment Method
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <PaymentMethod>
                        <FormControlLabel
                          value="credit_card"
                          control={<Radio />}
                          label="Credit Card"
                        />
                      </PaymentMethod>
                    </Grid>
                    <Grid item xs={12}>
                      <PaymentMethod>
                        <FormControlLabel
                          value="paypal"
                          control={<Radio />}
                          label="PayPal"
                        />
                      </PaymentMethod>
                    </Grid>
                  </Grid>
                </RadioGroup>
              </Grid>
              {paymentMethod === 'credit_card' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Expiry Date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="CVV"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Box textAlign="center" py={4}>
              <CheckIcon
                sx={{
                  fontSize: 64,
                  color: 'success.main',
                  mb: 2,
                }}
              />
              <Typography variant="h5" gutterBottom>
                Purchase Complete!
              </Typography>
              <Typography color="text.secondary">
                Your gift card has been sent to {recipientEmail}
              </Typography>
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box py={4}>
      <StyledCard>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box mt={4}>
            <AnimatePresence mode="wait">
              {getStepContent(activeStep)}
            </AnimatePresence>
          </Box>

          <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
            {activeStep !== 0 && activeStep !== steps.length - 1 && (
              <Button onClick={handleBack}>Back</Button>
            )}
            {activeStep !== steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || (activeStep === 0 && !amount && !customAmount)}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  activeStep === steps.length - 2 ? 'Purchase' : 'Next'
                )}
              </Button>
            )}
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  );
};
