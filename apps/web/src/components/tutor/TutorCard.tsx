import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  Rating,
  styled,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Verified as VerifiedIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { Tutor } from '@/types';
import { formatCurrency } from '@/utils/format';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
  },
}));

const TutorAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  '&.subject': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  '&.language': {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  },
}));

interface TutorCardProps {
  tutor: Tutor;
  onBookTrial?: () => void;
  onQuickChat?: () => void;
  onViewProfile?: () => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  onBookTrial,
  onQuickChat,
  onViewProfile,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <StyledCard>
        <CardContent>
          <Box display="flex" alignItems="flex-start" mb={3}>
            <TutorAvatar src={tutor.avatar} alt={tutor.name} />
            <Box ml={2} flex={1}>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="h6" component="h3">
                  {tutor.name}
                </Typography>
                {tutor.verificationStatus === 'verified' && (
                  <VerifiedIcon
                    sx={{ ml: 1, color: 'primary.main' }}
                    fontSize="small"
                  />
                )}
              </Box>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                {tutor.headline}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Rating value={tutor.rating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="textSecondary">
                  ({tutor.totalReviews})
                </Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {formatCurrency(tutor.hourlyRate)}/hour
              </Typography>
            </Box>
          </Box>

          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <SchoolIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {tutor.education[0]?.degree} in {tutor.education[0]?.field}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {tutor.totalLessons}+ lessons taught
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LanguageIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {tutor.languages.map(lang => lang.name).join(', ')}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {tutor.subjects.map(subject => (
              <StyledChip
                key={subject.id}
                label={subject.name}
                size="small"
                className="subject"
              />
            ))}
          </Box>

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {tutor.bio}
          </Typography>
        </CardContent>

        <CardActions sx={{ mt: 'auto', p: 2, pt: 0 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={onBookTrial}
            sx={{ mr: 1 }}
          >
            Book Trial Lesson
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={onQuickChat}
          >
            Quick Chat
          </Button>
        </CardActions>
      </StyledCard>
    </motion.div>
  );
};
