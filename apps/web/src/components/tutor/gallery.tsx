import { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'

export function TutorGallery({ tutorId }: { tutorId: string }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // TODO: 从API获取导师图片和视频
  const gallery = {
    video: {
      thumbnail: '/images/tutors/video-thumbnail.jpg',
      url: 'https://example.com/video.mp4'
    },
    images: [
      '/images/tutors/gallery-1.jpg',
      '/images/tutors/gallery-2.jpg',
      '/images/tutors/gallery-3.jpg',
      '/images/tutors/gallery-4.jpg'
    ]
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">教学展示</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* 视频缩略图 */}
        <div className="col-span-2 md:col-span-1">
          <div className="relative aspect-video rounded-lg overflow-hidden group">
            <Image
              src={gallery.video.thumbnail}
              alt="课程介绍视频"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="text-white">
                <Play className="h-12 w-12" />
              </Button>
            </div>
          </div>
        </div>

        {/* 图片网格 */}
        {gallery.images.map((image, index) => (
          <Dialog key={image}>
            <DialogTrigger asChild>
              <div
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`教学环境 ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <div className="relative aspect-video">
                <Image
                  src={image}
                  alt={`教学环境 ${index + 1}`}
                  fill
                  className="object-contain"
                />
                {/* 导航按钮 */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setSelectedImage(
                        (selectedImage! - 1 + gallery.images.length) %
                          gallery.images.length
                      )
                    }
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setSelectedImage(
                        (selectedImage! + 1) % gallery.images.length
                      )
                    }
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </Card>
  )
}
