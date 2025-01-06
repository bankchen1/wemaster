import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Preload } from '@react-three/drei';
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
import { useI18n } from '@/hooks/useI18n';

// 3D Model Component
const Model = () => {
  const { scene } = useGLTF('/models/education_3d.glb');
  return <primitive object={scene} scale={1.5} />;
};

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '90vh',
  display: 'flex',
  alignItems: 'center',
  background: theme.palette.gradient.primary,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url(/images/pattern.svg)',
    opacity: 0.1,
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: theme.palette.gradient.secondary,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

// Main Component
export const Home: React.FC = () => {
  const theme = useTheme();
  const { t } = useI18n();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h1" color="white" gutterBottom>
                  {t('home.hero.title')}
                  <GradientText component="span">
                    {t('home.hero.highlight')}
                  </GradientText>
                </Typography>
                <Typography variant="h5" color="white" paragraph>
                  {t('home.hero.subtitle')}
                </Typography>
                <Box mt={4}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ mr: 2 }}
                  >
                    {t('home.hero.cta.primary')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    {t('home.hero.cta.secondary')}
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box height="500px">
                <Canvas camera={{ position: [0, 0, 5] }}>
                  <ambientLight intensity={0.5} />
                  <spotLight position={[10, 10, 10]} angle={0.15} />
                  <Model />
                  <OrbitControls enableZoom={false} />
                  <Preload all />
                </Canvas>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Box py={12}>
        <Container maxWidth="lg">
          <motion.div style={{ y }}>
            <Typography variant="h2" align="center" gutterBottom>
              {t('home.features.title')}
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              paragraph
            >
              {t('home.features.subtitle')}
            </Typography>
            <Grid container spacing={4} mt={4}>
              {[
                {
                  icon: '🎓',
                  title: 'home.features.expert.title',
                  description: 'home.features.expert.description',
                },
                {
                  icon: '⚡',
                  title: 'home.features.speed.title',
                  description: 'home.features.speed.description',
                },
                {
                  icon: '🌟',
                  title: 'home.features.quality.title',
                  description: 'home.features.quality.description',
                },
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <FeatureCard>
                      <CardContent>
                        <Box mb={2}>{feature.icon}</Box>
                        <Typography variant="h5" gutterBottom>
                          {t(feature.title)}
                        </Typography>
                        <Typography color="textSecondary">
                          {t(feature.description)}
                        </Typography>
                      </CardContent>
                    </FeatureCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Social Proof Section */}
      <Box
        py={12}
        sx={{
          background: theme.palette.gradient.primary,
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                {t('home.stats.title')}
              </Typography>
              <Typography variant="h5" paragraph>
                {t('home.stats.subtitle')}
              </Typography>
              <Grid container spacing={3} mt={4}>
                {[
                  {
                    value: '50K+',
                    label: 'home.stats.students',
                  },
                  {
                    value: '1000+',
                    label: 'home.stats.tutors',
                  },
                  {
                    value: '4.9',
                    label: 'home.stats.rating',
                  },
                  {
                    value: '100+',
                    label: 'home.stats.subjects',
                  },
                ].map((stat, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography variant="h3" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1">{t(stat.label)}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Add testimonial carousel here */}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={12}>
        <Container maxWidth="md">
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              background: theme.palette.gradient.secondary,
              color: 'white',
            }}
          >
            <Typography variant="h3" gutterBottom>
              {t('home.cta.title')}
            </Typography>
            <Typography variant="h6" paragraph>
              {t('home.cta.subtitle')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
            >
              {t('home.cta.button')}
            </Button>
          </Card>
        </Container>
      </Box>
    </>
  );
};
