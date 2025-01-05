import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorGalleryProps {
  tutorId: string;
}

interface GalleryItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
}

export function TutorGallery({ tutorId }: TutorGalleryProps) {
  const [selectedTab, setSelectedTab] = useState('photos');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 模拟数据，实际应该从API获取
  const galleryItems: GalleryItem[] = [
    {
      type: 'image',
      url: '/tutor-photos/1.jpg',
      title: 'Teaching Session',
      description: 'Interactive math class with students',
    },
    {
      type: 'video',
      url: '/tutor-videos/intro.mp4',
      thumbnail: '/tutor-videos/intro-thumb.jpg',
      title: 'Introduction Video',
      description: 'Learn about my teaching style and approach',
    },
    // ... 更多图片和视频
  ];

  const photos = galleryItems.filter(item => item.type === 'image');
  const videos = galleryItems.filter(item => item.type === 'video');

  const handleItemClick = (item: GalleryItem, index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    const items = selectedTab === 'photos' ? photos : videos;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    setSelectedItem(items[currentIndex > 0 ? currentIndex - 1 : items.length - 1]);
  };

  const handleNext = () => {
    const items = selectedTab === 'photos' ? photos : videos;
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    setSelectedItem(items[currentIndex < items.length - 1 ? currentIndex + 1 : 0]);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gallery</h2>

      <Tabs defaultValue="photos" onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="photos">Photos ({photos.length})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handleItemClick(photo, index)}
              >
                <Image
                  src={photo.url}
                  alt={photo.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                    <div className="text-sm font-medium">{photo.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handleItemClick(video, index)}
              >
                <Image
                  src={video.thumbnail || ''}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-800" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="text-white">
                    <div className="font-medium">{video.title}</div>
                    {video.description && (
                      <div className="text-sm text-gray-200">{video.description}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          <div className="relative">
            {selectedItem?.type === 'image' ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <video
                src={selectedItem?.url}
                controls
                className="w-full aspect-video"
                poster={selectedItem?.thumbnail}
              />
            )}

            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={handleNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium">{selectedItem?.title}</h3>
            {selectedItem?.description && (
              <p className="text-gray-600 mt-1">{selectedItem.description}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
