import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  styled,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Subject } from '@/types';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: theme.palette.background.paper,
  borderRadius: '20px',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
    '& .subject-icon': {
      transform: 'scale(1.1)',
    },
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease',
}));

interface SubjectCardProps {
  subject: Subject;
  onClick?: () => void;
  featured?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onClick,
  featured = false,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <StyledCard
        onClick={onClick}
        sx={{
          border: featured ? `2px solid ${theme.palette.primary.main}` : 'none',
        }}
      >
        <CardContent>
          <IconWrapper
            className="subject-icon"
            sx={{
              backgroundColor: featured
                ? theme.palette.primary.light
                : theme.palette.grey[100],
            }}
          >
            <Typography variant="h4">{subject.icon}</Typography>
          </IconWrapper>
          <Typography variant="h6" gutterBottom>
            {subject.name}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {subject.description}
          </Typography>
          {featured && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2,
                color: 'primary.main',
              }}
            >
              <Typography variant="caption">Popular Choice</Typography>
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                }}
              />
            </Box>
          )}
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};
