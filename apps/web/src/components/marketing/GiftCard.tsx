import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  useTheme,
  styled,
} from '@mui/material';
import {
  CardGiftcard as GiftIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.1,
  },
}));

const GiftCardPreview = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: '15px',
  padding: theme.spacing(3),
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  minHeight: 200,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150%',
    height: '150%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
    pointerEvents: 'none',
  },
}));

const amounts = [25, 50, 100, 200, 500];

export const GiftCard: React.FC = () => {
  const theme = useTheme();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value) && Number(value) <= 1000) {
      setCustomAmount(value);
      if (value) setAmount(Number(value));
    }
  };

  const handleSendGift = () => {
    // Implement gift card sending logic
    console.log({
      amount,
      recipientEmail,
      message,
    });
    setOpenDialog(false);
  };

  return (
    <Box py={8}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Give the Gift of Learning
            </Typography>
            <Typography color="text.secondary" paragraph>
              Share the joy of learning with your loved ones. WeMaster gift cards
              are perfect for any occasion and can be used for any tutoring session.
            </Typography>

            <Box mb={4}>
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                Select Amount
              </Typography>
              <Grid container spacing={2}>
                {amounts.map((value) => (
                  <Grid item key={value}>
                    <Button
                      variant={amount === value ? 'contained' : 'outlined'}
                      onClick={() => setAmount(value)}
                      sx={{ minWidth: 100 }}
                    >
                      ${value}
                    </Button>
                  </Grid>
                ))}
                <Grid item xs={12} sm="auto">
                  <TextField
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    InputProps={{
                      startAdornment: '$',
                    }}
                    sx={{ minWidth: 150 }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ mr: 2 }}
            >
              Send as Gift
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<CopyIcon />}
            >
              Buy for Yourself
            </Button>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GiftCardPreview>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h5" fontWeight={600}>
                  WeMaster Gift Card
                </Typography>
                <GiftIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  ${amount}
                </Typography>
                <Typography variant="subtitle1">
                  For: Someone Special
                </Typography>
              </Box>
            </GiftCardPreview>
          </motion.div>
        </Grid>
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Gift Card</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <TextField
              label="Recipient's Email"
              fullWidth
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Personal Message (Optional)"
              fullWidth
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendGift}
            startIcon={<SendIcon />}
          >
            Send Gift Card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
