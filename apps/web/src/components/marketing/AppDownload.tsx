import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  useTheme,
  styled,
} from '@mui/material';
import {
  Apple as AppleIcon,
  Android as AndroidIcon,
  QrCode2 as QRCodeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Image from 'next/image';

const StyledSection = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(8, 0),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
    zIndex: 0,
  },
}));

const AppButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textAlign: 'left',
  justifyContent: 'flex-start',
  minWidth: 200,
}));

const QRCode = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: theme.shadows[1],
}));

interface AppDownloadProps {
  appStoreUrl?: string;
  playStoreUrl?: string;
  qrCodeUrl?: string;
}

export const AppDownload: React.FC<AppDownloadProps> = ({
  appStoreUrl = 'https://apps.apple.com/app/wemaster',
  playStoreUrl = 'https://play.google.com/store/apps/details?id=com.wemaster',
  qrCodeUrl = '/qr-code.png',
}) => {
  const theme = useTheme();

  const features = [
    'Learn anytime, anywhere',
    'Real-time video lessons',
    'Chat with tutors instantly',
    'Track your progress',
    'Schedule management',
    'Offline access to materials',
  ];

  return (
    <StyledSection>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                fontWeight={700}
              >
                Take Your Learning
                <br />
                <Typography
                  component="span"
                  variant="h3"
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  On the Go
                </Typography>
              </Typography>

              <Typography
                variant="h6"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                Download the WeMaster app and transform any moment into a learning
                opportunity. Available for iOS and Android devices.
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                        }}
                      />
                      <Typography variant="body1">{feature}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box display="flex" gap={2} flexWrap="wrap">
                <AppButton
                  variant="contained"
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AppleIcon fontSize="large" />
                  <Box>
                    <Typography variant="caption" display="block">
                      Download on the
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      App Store
                    </Typography>
                  </Box>
                </AppButton>

                <AppButton
                  variant="contained"
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <AndroidIcon fontSize="large" />
                  <Box>
                    <Typography variant="caption" display="block">
                      Get it on
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Google Play
                    </Typography>
                  </Box>
                </AppButton>
              </Box>
            </motion.div>
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="relative"
              >
                {/* App Screenshots */}
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 600,
                  }}
                >
                  <Image
                    src="/app-preview.png"
                    alt="WeMaster App"
                    layout="fill"
                    objectFit="contain"
                  />
                </Box>

                {/* QR Code */}
                <Box
                  position="absolute"
                  bottom={40}
                  right={40}
                  textAlign="center"
                >
                  <QRCode>
                    <Image
                      src={qrCodeUrl}
                      alt="Download QR Code"
                      width={100}
                      height={100}
                    />
                  </QRCode>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 1, color: 'text.secondary' }}
                  >
                    Scan to Download
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </StyledSection>
  );
};
