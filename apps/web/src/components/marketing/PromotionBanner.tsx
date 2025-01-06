import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  useTheme,
  styled,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalOffer as OfferIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledBanner = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
    pointerEvents: 'none',
  },
}));

const CountdownBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
}));

interface PromotionBannerProps {
  title?: string;
  description?: string;
  code?: string;
  endDate?: Date;
  onClose?: () => void;
}

export const PromotionBanner: React.FC<PromotionBannerProps> = ({
  title = 'Special Offer!',
  description = 'Get 20% off your first lesson',
  code = 'WELCOME20',
  endDate = new Date('2025-02-01'),
  onClose,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <Collapse in={isVisible}>
      <StyledBanner>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Box
              py={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
            >
              {/* Offer Content */}
              <Box display="flex" alignItems="center" gap={2}>
                <OfferIcon fontSize="large" />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {title}
                  </Typography>
                  <Typography variant="body2">
                    {description}
                  </Typography>
                </Box>
              </Box>

              {/* Promotion Code */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                sx={{ order: { xs: 3, md: 2 } }}
              >
                <Box
                  sx={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  {code}
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  Claim Now
                </Button>
              </Box>

              {/* Countdown Timer */}
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ order: { xs: 2, md: 3 } }}
              >
                <TimerIcon />
                <CountdownBox>
                  <Typography variant="body2" fontWeight={600}>
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                  </Typography>
                </CountdownBox>
                <IconButton
                  size="small"
                  onClick={handleClose}
                  sx={{ color: 'inherit' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </StyledBanner>
    </Collapse>
  );
};
