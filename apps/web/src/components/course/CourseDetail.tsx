import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
  Users,
  Star,
  BookOpen,
  PlayCircle,
  Award,
  FileText,
  MessageSquare,
  Globe,
  Languages,
  Certificate,
  Calendar,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment';
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  content: string;
}

interface CourseDetailProps {
  course: {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    thumbnail: string;
    tutorName: string;
    tutorAvatar: string;
    tutorBio: string;
    rating: number;
    totalReviews: number;
    totalStudents: number;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    progress?: number;
    sections: Section[];
    price: number;
    tags: string[];
    isEnrolled?: boolean;
    language: string;
    lastUpdated: string;
    certificate: boolean;
    prerequisites: string[];
    learningOutcomes: string[];
    reviews: Review[];
  };
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const totalLessons = course.sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );

  const completedLessons = course.sections.reduce(
    (acc, section) =>
      acc +
      section.lessons.filter((lesson) => lesson.isCompleted).length,
    0
  );

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-lg text-muted-foreground">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="ml-1 font-medium">
                  {course.rating} ({course.totalReviews} reviews)
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5" />
                <span className="ml-1">
                  {course.totalStudents} students
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5" />
                <span className="ml-1">{course.duration}</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-5 w-5" />
                <span className="ml-1">{course.language}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5" />
                <span className="ml-1">
                  Last updated: {course.lastUpdated}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={course.tutorAvatar}
                    alt={course.tutorName}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{course.tutorName}</p>
                  <p className="text-sm text-muted-foreground">
                    Course Instructor
                  </p>
                </div>
              </div>
              <Badge className="text-sm">{course.level}</Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  About This Course
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {course.longDescription}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">
                  What You'll Learn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.learningOutcomes.map((outcome, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2"
                    >
                      <Award className="h-5 w-5 mt-1" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Prerequisites
                </h3>
                <div className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2"
                    >
                      <BookOpen className="h-5 w-5 mt-1" />
                      <span>{prerequisite}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Your Instructor
                </h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden">
                        <Image
                          src={course.tutorAvatar}
                          alt={course.tutorName}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold">
                          {course.tutorName}
                        </h4>
                        <p className="text-muted-foreground">
                          {course.tutorBio}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    Course Curriculum
                  </h3>
                  <p className="text-muted-foreground">
                    {totalLessons} lessons • {course.duration} total length
                  </p>
                </div>
                {course.isEnrolled && (
                  <div className="text-right">
                    <p className="font-medium">
                      {completedLessons} of {totalLessons} completed
                    </p>
                    <Progress
                      value={(completedLessons / totalLessons) * 100}
                      className="w-32"
                    />
                  </div>
                )}
              </div>

              <Accordion type="single" collapsible>
                {course.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full">
                        <span>{section.title}</span>
                        <span className="text-muted-foreground">
                          {section.lessons.length} lessons
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {section.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                          >
                            <div className="flex items-center space-x-2">
                              {lesson.type === 'video' && (
                                <PlayCircle className="h-4 w-4" />
                              )}
                              {lesson.type === 'quiz' && (
                                <FileText className="h-4 w-4" />
                              )}
                              {lesson.type === 'assignment' && (
                                <MessageSquare className="h-4 w-4" />
                              )}
                              <span
                                className={
                                  lesson.isCompleted
                                    ? 'line-through text-muted-foreground'
                                    : ''
                                }
                              >
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {lesson.isCompleted && (
                                <Badge variant="secondary">
                                  Completed
                                </Badge>
                              )}
                              {lesson.isLocked && (
                                <Badge variant="outline">Locked</Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    Student Reviews
                  </h3>
                  <p className="text-muted-foreground">
                    {course.totalReviews} reviews
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <Star className="h-6 w-6 text-yellow-500 fill-current" />
                    <span className="ml-2 text-2xl font-bold">
                      {course.rating}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Course Rating
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {course.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={review.userAvatar}
                            alt={review.userName}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              {review.userName}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground">
                            {review.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6 space-y-6">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    ${course.price}
                  </span>
                </div>

                <Button className="w-full text-lg" size="lg">
                  {course.isEnrolled ? (
                    <>
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <Award className="h-5 w-5 mr-2" />
                      Enroll Now
                    </>
                  )}
                </Button>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration} of content</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Languages className="h-5 w-5" />
                    <span>{course.language}</span>
                  </div>
                  {course.certificate && (
                    <div className="flex items-center space-x-2">
                      <Certificate className="h-5 w-5" />
                      <span>Certificate of completion</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
