import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { StarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { searchTutors } from '@/lib/api/student';

export function TutorSearch() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tutors, isLoading } = useQuery(
    ['tutors', subject, priceRange, searchQuery],
    () => searchTutors({ subject, priceRange, query: searchQuery }),
    {
      keepPreviousData: true,
    }
  );

  const handleBookTutor = (tutorId: string) => {
    router.push(`/booking/${tutorId}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 搜索过滤器 */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="搜索导师姓名或简介"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64"
        />
        
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="选择科目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="math">数学</SelectItem>
            <SelectItem value="english">英语</SelectItem>
            <SelectItem value="physics">物理</SelectItem>
            <SelectItem value="chemistry">化学</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="价格区间" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-100">¥0-100/小时</SelectItem>
            <SelectItem value="100-200">¥100-200/小时</SelectItem>
            <SelectItem value="200-300">¥200-300/小时</SelectItem>
            <SelectItem value="300+">¥300+/小时</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 导师列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="p-6 space-y-4 animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </Card>
            ))
        ) : (
          tutors?.map((tutor) => (
            <Card key={tutor.id} className="p-6 space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar
                  src={tutor.avatar}
                  alt={tutor.name}
                  className="w-16 h-16"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{tutor.name}</h3>
                    <div className="flex items-center text-yellow-500">
                      <StarIcon className="w-4 h-4 mr-1" />
                      <span>{tutor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tutor.title}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm line-clamp-2">{tutor.bio}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      ¥{tutor.pricePerHour}/小时
                    </p>
                    <p className="text-xs text-muted-foreground">
                      已完成 {tutor.completedLessons} 节课
                    </p>
                  </div>
                  <Button
                    onClick={() => handleBookTutor(tutor.id)}
                  >
                    立即预约
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
