import { Suspense } from 'react';
import { Metadata } from 'next';
import { ApplicationList } from '@/components/admin/tutor/ApplicationList';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const metadata: Metadata = {
  title: '导师申请管理 | WeMaster',
  description: '管理导师申请，审核导师资质',
};

export default function TutorApplicationsPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="导师申请管理"
        description="查看和审核导师申请"
      />
      
      <Suspense fallback={<LoadingSpinner />}>
        <ApplicationList />
      </Suspense>
    </div>
  );
}
