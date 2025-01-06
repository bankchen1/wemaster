import React, { createContext, useContext, useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  path: string;
}

interface OnboardingContextType {
  currentStep: number;
  steps: OnboardingStep[];
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const defaultSteps: OnboardingStep[] = [
  {
    id: 'profile',
    title: '完善个人资料',
    description: '设置您的基本信息',
    component: () => <div>Profile Step</div>,
    path: '/onboarding/profile'
  },
  {
    id: 'preferences',
    title: '学习偏好',
    description: '设置您的学习目标和偏好',
    component: () => <div>Preferences Step</div>,
    path: '/onboarding/preferences'
  },
  {
    id: 'schedule',
    title: '时间安排',
    description: '设置您的可用时间',
    component: () => <div>Schedule Step</div>,
    path: '/onboarding/schedule'
  }
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const nextStep = () => {
    if (currentStep < defaultSteps.length - 1) {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        navigate(defaultSteps[nextStep].path);
        return nextStep;
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => {
        const prevStep = prev - 1;
        navigate(defaultSteps[prevStep].path);
        return prevStep;
      });
    }
  };

  const completeOnboarding = () => {
    // 在这里调用API保存onboarding状态
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        steps: defaultSteps,
        nextStep,
        prevStep,
        completeOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentStep, steps } = useOnboarding();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.id}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {children}
    </Box>
  );
};
