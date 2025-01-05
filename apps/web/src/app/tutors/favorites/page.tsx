import { Suspense } from 'react';
import { Metadata } from 'next';
import { FavoritesList } from '@/components/tutor/FavoritesList';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: '我的收藏 - WeTeach',
  description: '查看和管理您收藏的导师',
};

export default function FavoritesPage() {
  return (
    <div className="container mx-auto py-8">
      <Breadcrumb
        items={[
          { label: '导师', href: '/tutors' },
          { label: '我的收藏', href: '/tutors/favorites' },
        ]}
        className="mb-6"
      />

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">我的收藏</h1>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-40 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <FavoritesList userId="current" />
      </Suspense>
    </div>
  );
}
