import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Alert,
  Checkbox,
  styled,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    padding: theme.spacing(2),
    maxWidth: '500px',
    width: '100%',
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

interface AgeVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (data: VerificationData) => void;
}

interface VerificationData {
  ageGroup: 'under14' | 'under18' | 'adult';
  parentEmail?: string;
  parentPhone?: string;
  hasParentConsent: boolean;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  open,
  onClose,
  onVerify,
}) => {
  const [ageGroup, setAgeGroup] = useState<'under14' | 'under18' | 'adult'>('adult');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [hasParentConsent, setHasParentConsent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (ageGroup === 'under14' || ageGroup === 'under18') {
      if (!parentEmail && !parentPhone) {
        setError('Please provide either parent email or phone number');
        return;
      }
      if (!hasParentConsent) {
        setError('Parent consent is required');
        return;
      }
    }

    onVerify({
      ageGroup,
      parentEmail,
      parentPhone,
      hasParentConsent,
    });
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="age-verification-dialog"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <DialogTitle>
            <Typography variant="h5" component="h2">
              Age Verification
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography color="textSecondary" paragraph>
              To ensure a safe learning environment, please verify your age group.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <FormSection>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>
                  Select your age group:
                </Typography>
                <RadioGroup
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as any)}
                >
                  <FormControlLabel
                    value="under14"
                    control={<Radio />}
                    label="Under 14 years old"
                  />
                  <FormControlLabel
                    value="under18"
                    control={<Radio />}
                    label="14-17 years old"
                  />
                  <FormControlLabel
                    value="adult"
                    control={<Radio />}
                    label="18 years or older"
                  />
                </RadioGroup>
              </FormControl>
            </FormSection>

            {(ageGroup === 'under14' || ageGroup === 'under18') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FormSection>
                  <Typography variant="subtitle2" gutterBottom>
                    Parent/Guardian Contact Information:
                  </Typography>
                  <TextField
                    fullWidth
                    label="Parent's Email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Parent's Phone Number"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    margin="normal"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={hasParentConsent}
                        onChange={(e) => setHasParentConsent(e.target.checked)}
                      />
                    }
                    label="I confirm that I have parent/guardian consent"
                  />
                </FormSection>
              </motion.div>
            )}

            <Typography variant="body2" color="textSecondary">
              By continuing, you agree to our{' '}
              <Button color="primary" size="small">
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button color="primary" size="small">
                Privacy Policy
              </Button>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
            >
              Continue
            </Button>
          </DialogActions>
        </motion.div>
      </AnimatePresence>
    </StyledDialog>
  );
};
