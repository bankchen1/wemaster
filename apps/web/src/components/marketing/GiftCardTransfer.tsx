import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  useTheme,
  styled,
} from '@mui/material';
import {
  Send as SendIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectGiftCards,
  selectGiftCardLoading,
  transferGiftCard,
} from '@/store/giftCardSlice';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
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

const GiftCardItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const GiftCardTransfer: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const giftCards = useSelector(selectGiftCards);
  const loading = useSelector(selectGiftCardLoading);

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleTransfer = async () => {
    if (!selectedCard) return;

    await dispatch(transferGiftCard({
      cardId: selectedCard,
      recipientEmail,
      message,
    }));

    setOpenDialog(false);
    setSelectedCard(null);
    setRecipientEmail('');
    setMessage('');
  };

  const copyCardCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Add toast notification here
  };

  return (
    <Box py={4}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Your Gift Cards
      </Typography>
      
      <AnimatePresence>
        {giftCards.length > 0 ? (
          <List>
            {giftCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <GiftCardItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          ${card.balance}
                        </Typography>
                        <Chip
                          label={card.isActive ? 'Active' : 'Inactive'}
                          color={card.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Code: {card.code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Expires: {new Date(card.expiryDate).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => copyCardCode(card.code)}
                      sx={{ mr: 1 }}
                    >
                      <CopyIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => {
                        setSelectedCard(card.id);
                        setOpenDialog(true);
                      }}
                      disabled={!card.isActive}
                    >
                      Transfer
                    </Button>
                  </ListItemSecondaryAction>
                </GiftCardItem>
              </motion.div>
            ))}
          </List>
        ) : (
          <StyledCard>
            <Box display="flex" alignItems="center" gap={2}>
              <InfoIcon color="action" />
              <Typography color="text.secondary">
                You don't have any gift cards yet.
              </Typography>
            </Box>
          </StyledCard>
        )}
      </AnimatePresence>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transfer Gift Card</DialogTitle>
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
              label="Message (Optional)"
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
            onClick={handleTransfer}
            disabled={loading || !recipientEmail}
            startIcon={<SendIcon />}
          >
            Transfer Card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
