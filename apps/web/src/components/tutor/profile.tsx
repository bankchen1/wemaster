import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MessageCircle, Video, Clock, Award, Heart } from 'lucide-react'

export function TutorProfile({ tutorId }: { tutorId: string }) {
  // TODO: 从API获取导师信息
  const tutor = {
    name: 'Sarah Johnson',
    avatar: '/images/tutors/sarah.jpg',
    title: '资深英语教师',
    rating: 4.9,
    reviewCount: 128,
    studentCount: 56,
    teachingHours: 1200,
    subjects: ['商务英语', '雅思备考', '英语口语'],
    languages: ['英语（母语）', '中文（流利）'],
    introduction: `
      拥有10年英语教学经验，专注于商务英语和雅思备考。
      毕业于剑桥大学教育学院，持有TESOL高级教师资格证。
      擅长根据学生需求定制个性化学习计划，课程互动性强，
      注重实践和应用。帮助多名学生成功提升英语水平，获得理想成绩。
    `,
    achievements: [
      '最受欢迎导师奖 2023',
      '优秀教学反馈奖 2022',
      '五星好评率 98%'
    ]
  }

  return (
    <Card className="p-6">
      {/* 基本信息 */}
      <div className="flex items-start gap-6">
        <div className="relative h-32 w-32 flex-shrink-0">
          <Image
            src={tutor.avatar}
            alt={tutor.name}
            fill
            className="rounded-lg object-cover"
          />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-background" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{tutor.name}</h1>
              <p className="text-muted-foreground">{tutor.title}</p>
            </div>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{tutor.rating}</span>
              <span className="text-muted-foreground">
                ({tutor.reviewCount} 评价)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>24小时内回复</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tutor.subjects.map((subject) => (
              <Badge key={subject} variant="secondary">
                {subject}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <span className="font-medium">{tutor.studentCount}</span>
          </div>
          <p className="text-sm text-muted-foreground">在教学生</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">{tutor.teachingHours}</span>
          </div>
          <p className="text-sm text-muted-foreground">授课小时</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="font-medium">98%</span>
          </div>
          <p className="text-sm text-muted-foreground">完课率</p>
        </div>
      </div>

      {/* 详细介绍 */}
      <div className="mt-6 space-y-4 border-t pt-6">
        <div>
          <h2 className="font-semibold">教学语言</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {tutor.languages.map((language) => (
              <Badge key={language} variant="outline">
                {language}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold">个人简介</h2>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">
            {tutor.introduction}
          </p>
        </div>

        <div>
          <h2 className="font-semibold">教学成就</h2>
          <ul className="mt-2 space-y-2">
            {tutor.achievements.map((achievement) => (
              <li
                key={achievement}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Award className="h-4 w-4 text-primary" />
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
