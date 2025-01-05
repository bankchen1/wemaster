import { Metadata } from 'next';
import { OnboardingForm } from '@/components/tutor/onboarding/OnboardingForm';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export const metadata: Metadata = {
  title: '成为导师 - WeTeach',
  description: '加入我们的导师团队，开始您的在线教学之旅',
};

export default function TutorOnboardingPage() {
  const breadcrumbItems = [
    { label: '导师', href: '/tutors' },
    { label: '成为导师', href: '/tutors/onboarding' },
  ];

  return (
    <div className="container mx-auto py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Become a Tutor</h1>
        <OnboardingForm />
      </div>
    </div>
  );
}
