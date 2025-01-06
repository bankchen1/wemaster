import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  styled,
} from '@mui/material';
import {
  MonetizationOn as MoneyIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Link as LinkIcon,
  School as SchoolIcon,
  AccountBalance as PaymentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const benefits = [
  {
    icon: <MoneyIcon />,
    title: 'High Commission Rates',
    description: 'Earn up to 30% commission on each successful referral for their first 3 months.',
  },
  {
    icon: <PeopleIcon />,
    title: 'Lifetime Referrals',
    description: 'Get rewarded for as long as your referred users stay active on our platform.',
  },
  {
    icon: <TimelineIcon />,
    title: 'Performance Bonuses',
    description: 'Unlock additional rewards and higher commission rates as you reach new milestones.',
  },
  {
    icon: <LinkIcon />,
    title: 'Easy Tracking',
    description: 'Monitor your referrals and earnings in real-time with our comprehensive dashboard.',
  },
  {
    icon: <SchoolIcon />,
    title: 'Marketing Resources',
    description: 'Access promotional materials and training to help you succeed.',
  },
  {
    icon: <PaymentIcon />,
    title: 'Reliable Payments',
    description: 'Get paid monthly via your preferred payment method with no minimum threshold.',
  },
];

const tiers = [
  {
    name: 'Bronze',
    commission: '20%',
    requirement: '0-10 referrals',
    features: [
      'Basic commission rate',
      'Standard support',
      'Monthly payments',
    ],
  },
  {
    name: 'Silver',
    commission: '25%',
    requirement: '11-50 referrals',
    features: [
      'Higher commission rate',
      'Priority support',
      'Bi-weekly payments',
      'Marketing materials',
    ],
  },
  {
    name: 'Gold',
    commission: '30%',
    requirement: '51+ referrals',
    features: [
      'Highest commission rate',
      'VIP support',
      'Weekly payments',
      'Custom marketing materials',
      'Performance bonuses',
    ],
  },
];

export const AffiliateProgram: React.FC = () => {
  const theme = useTheme();

  return (
    <Box py={8}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box textAlign="center" mb={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              fontWeight={700}
            >
              Join Our{' '}
              <GradientText component="span">
                Affiliate Program
              </GradientText>
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
            >
              Partner with WeMaster and earn competitive commissions while helping
              students find their perfect tutors.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: '30px',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Become an Affiliate
            </Button>
          </motion.div>
        </Box>

        {/* Benefits Section */}
        <Box mb={8}>
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            gutterBottom
            fontWeight={600}
          >
            Why Partner With Us?
          </Typography>
          <Grid container spacing={4} mt={2}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StyledCard>
                    <CardContent>
                      <IconWrapper>
                        {benefit.icon}
                      </IconWrapper>
                      <Typography
                        variant="h6"
                        gutterBottom
                        fontWeight={600}
                      >
                        {benefit.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {benefit.description}
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Commission Tiers */}
        <Box>
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            gutterBottom
            fontWeight={600}
          >
            Commission Tiers
          </Typography>
          <Grid container spacing={4} mt={2}>
            {tiers.map((tier, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <StyledCard
                    sx={{
                      backgroundColor:
                        index === 2
                          ? theme.palette.primary.light
                          : theme.palette.background.paper,
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h5"
                        gutterBottom
                        fontWeight={600}
                        color={index === 2 ? 'primary' : 'inherit'}
                      >
                        {tier.name}
                      </Typography>
                      <Typography
                        variant="h3"
                        gutterBottom
                        color={index === 2 ? 'primary' : 'inherit'}
                      >
                        {tier.commission}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {tier.requirement}
                      </Typography>
                      <Box mt={3}>
                        {tier.features.map((feature, featureIndex) => (
                          <Typography
                            key={featureIndex}
                            variant="body2"
                            sx={{ mb: 1 }}
                            color={
                              index === 2
                                ? 'primary.dark'
                                : 'text.secondary'
                            }
                          >
                            • {feature}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </StyledCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};
