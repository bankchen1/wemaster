import { TutorProfile } from '@/components/tutor/profile'
import { TutorGallery } from '@/components/tutor/gallery'
import { TutorReviews } from '@/components/tutor/reviews'
import { TutorSchedule } from '@/components/tutor/schedule'
import { TutorPricing } from '@/components/tutor/pricing'

export default function TutorDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧主要内容 */}
        <div className="lg:col-span-2 space-y-8">
          <TutorProfile tutorId={params.id} />
          <TutorGallery tutorId={params.id} />
          <TutorReviews tutorId={params.id} />
        </div>

        {/* 右侧边栏 */}
        <div className="space-y-6">
          <TutorPricing tutorId={params.id} />
          <TutorSchedule tutorId={params.id} />
        </div>
      </div>
    </div>
  )
}
