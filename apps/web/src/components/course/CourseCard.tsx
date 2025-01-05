import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Users,
  Star,
  BookOpen,
  PlayCircle,
  Award,
} from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    tutorName: string;
    tutorAvatar: string;
    rating: number;
    totalStudents: number;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    progress?: number;
    totalLessons: number;
    completedLessons?: number;
    price: number;
    tags: string[];
    isEnrolled?: boolean;
  };
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-video">
        <Image
          src={course.thumbnail}
          alt={course.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
        />
        {course.isEnrolled && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">Enrolled</Badge>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={getLevelColor(course.level)}>
              {course.level}
            </Badge>
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm">{course.rating}</span>
            </div>
          </div>
          
          <h3 className="font-semibold text-lg line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration}
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            {course.totalLessons} lessons
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {course.totalStudents}
          </div>
        </div>

        {course.isEnrolled && course.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={course.tutorAvatar}
                alt={course.tutorName}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <span className="text-sm font-medium">{course.tutorName}</span>
          </div>
          <div className="text-lg font-bold">
            ${course.price}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          className="w-full"
          onClick={() => router.push(`/courses/${course.id}`)}
        >
          {course.isEnrolled ? (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Continue Learning
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              Enroll Now
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
