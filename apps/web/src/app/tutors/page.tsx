import { Metadata } from 'next';
import { Suspense } from 'react';
import { TutorList } from '@/components/tutor/TutorList';
import { TutorFilters } from '@/components/tutor/TutorFilters';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Find Tutors | Wepal',
  description: 'Find the perfect tutor for your learning needs',
};

export default function TutorsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tutors', href: '/tutors' },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Breadcrumb items={breadcrumbItems} />
        <Link href="/tutors/onboarding">
          <Button>Become a Tutor</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <TutorFilters />
        </aside>

        <main className="lg:col-span-3">
          <Suspense fallback={<div>Loading tutors...</div>}>
            <TutorList searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
