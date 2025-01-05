import { Suspense } from 'react';
import { Metadata } from 'next';
import { TutorProfileForm } from '@/components/tutor/profile/TutorProfileForm';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const metadata: Metadata = {
  title: '完善导师资料 | WeMaster',
  description: '完善您的导师资料，开始您的教学之旅',
};

export default function TutorProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="完善导师资料"
        description="请完善您的导师资料，让学生更好地了解您"
      />
      
      <Suspense fallback={<LoadingSpinner />}>
        <TutorProfileForm />
      </Suspense>
    </div>
  );
}
