import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { BackgroundStep } from './steps/BackgroundStep';
import { TeachingPreferencesStep } from './steps/TeachingPreferencesStep';
import { PricingStep } from './steps/PricingStep';
import { AgreementStep } from './steps/AgreementStep';
import { tutorOnboardingSchema } from '@/lib/validations/tutor';
import { updateTutorProfile } from '@/lib/api/tutor';
import { useToast } from '@/components/ui/use-toast';

const steps = [
  {
    id: 'personal',
    title: '个人信息',
    icon: '👤',
    component: PersonalInfoStep,
  },
  {
    id: 'background',
    title: '背景介绍',
    icon: '📚',
    component: BackgroundStep,
  },
  {
    id: 'teaching',
    title: '教学偏好',
    icon: '🎓',
    component: TeachingPreferencesStep,
  },
  {
    id: 'pricing',
    title: '课程定价',
    icon: '💰',
    component: PricingStep,
  },
  {
    id: 'agreement',
    title: '签署协议',
    icon: '📝',
    component: AgreementStep,
  },
];

export function TutorOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  
  const methods = useForm({
    resolver: zodResolver(tutorOnboardingSchema),
    defaultValues: {
      personalInfo: {
        displayName: '',
        title: '',
        bio: '',
        avatarUrl: '',
      },
      background: {
        education: '',
        experience: '',
        certificates: [],
        videoIntro: '',
      },
      teaching: {
        subjects: [],
        levels: [],
        languages: [],
        teachingStyle: '',
      },
      pricing: {
        trialLesson: {
          enabled: true,
          duration: 30,
          price: 0,
        },
        basicLesson: {
          price: 0,
          duration: 30,
        },
        packages: {
          '5': { enabled: false, discount: 0 },
          '10': { enabled: false, discount: 0 },
          '20': { enabled: false, discount: 0 },
          '40': { enabled: false, discount: 0 },
        },
      },
      agreement: {
        termsAccepted: false,
        commissionAccepted: false,
      },
    },
  });

  const CurrentStepComponent = steps[currentStep].component;

  const onSubmit = async (data: any) => {
    try {
      if (currentStep === steps.length - 1) {
        // 计算实际价格和平台分成
        const basicPrice = data.pricing.basicLesson.price;
        const platformFee = basicPrice * 0.25; // 25% 平台基础分成
        const studentPrice = basicPrice + platformFee;

        // 转换数据格式以匹配 API
        const profileData = {
          displayName: data.personalInfo.displayName,
          title: data.personalInfo.title,
          bio: data.personalInfo.bio,
          avatarUrl: data.personalInfo.avatarUrl,
          videoIntro: data.background.videoIntro,
          subjects: data.teaching.subjects,
          levels: data.teaching.levels,
          languages: data.teaching.languages,
          teachingStyle: data.teaching.teachingStyle,
          pricing: {
            hourlyRate: basicPrice,
            trialRate: data.pricing.trialLesson.price,
            groupRate: basicPrice * 0.8, // 团课折扣
            groupSize: 5,
          },
          packages: Object.entries(data.pricing.packages)
            .filter(([_, pkg]: [string, any]) => pkg.enabled)
            .map(([lessons, pkg]: [string, any]) => ({
              lessons: parseInt(lessons),
              discount: pkg.discount,
            })),
        };

        await updateTutorProfile(profileData);
        toast({
          title: '提交成功',
          description: '您的导师资料已提交审核，我们会尽快处理',
        });
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (error) {
      toast({
        title: '提交失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <Progress value={(currentStep + 1) * (100 / steps.length)} />
          
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index === currentStep
                    ? 'text-primary'
                    : index < currentStep
                    ? 'text-muted-foreground'
                    : 'text-muted'
                }`}
              >
                <span className="text-2xl mb-2">{step.icon}</span>
                <span className="text-sm">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <CurrentStepComponent />

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 0}
          >
            上一步
          </Button>
          
          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => methods.reset()}
            >
              保存草稿
            </Button>
            <Button type="submit">
              {currentStep === steps.length - 1 ? '提交审核' : '下一步'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
