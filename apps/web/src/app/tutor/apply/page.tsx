import { TutorApplicationForm } from '@/components/tutor/application-form'

export default function TutorApplicationPage() {
  return (
    <div className="container max-w-4xl py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">成为WeMaster导师</h1>
        <p className="text-xl text-muted-foreground">
          加入我们的全球教育平台，与来自世界各地的学生分享您的知识
        </p>
      </div>
      <TutorApplicationForm />
    </div>
  )
}
