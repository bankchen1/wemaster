import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Users2,
  MessageSquare,
  Video,
  PenTool,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react'

const features = [
  {
    title: '实时互动课堂',
    description: '高清视频会议，互动白板，实时聊天等功能，打造身临其境的学习体验',
    icon: Video
  },
  {
    title: '一对一&小组课程',
    description: '灵活的课程模式，满足个性化学习需求，也可参与小组讨论提升学习效果',
    icon: Users2
  },
  {
    title: '智能课程匹配',
    description: '基于学习目标和个人特点，智能推荐最适合的课程和导师',
    icon: BookOpen
  },
  {
    title: '实时交流互动',
    description: '课堂内外随时与导师和同学交流，答疑解惑，分享心得',
    icon: MessageSquare
  },
  {
    title: '互动教学工具',
    description: '电子白板，课件共享，课堂投票等多样化教学工具，提升教学效果',
    icon: PenTool
  },
  {
    title: '学习数据分析',
    description: '详细的学习进度追踪和数据分析，帮助优化学习方案',
    icon: BarChart3
  },
  {
    title: '灵活课程安排',
    description: '24/7全天候课程预约，根据个人时间自由安排学习计划',
    icon: Calendar
  },
  {
    title: '专业认证体系',
    description: '完整的学习认证体系，获得权威机构认可的技能证书',
    icon: Award
  }
]

export function Features() {
  return (
    <section className="container py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          为什么选择 WeMaster
        </h2>
        <p className="text-lg text-muted-foreground">
          我们提供全方位的在线教育解决方案，让学习更高效、更有趣
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 数据统计 */}
      <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">1M+</p>
          <p className="text-muted-foreground">注册用户</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">50+</p>
          <p className="text-muted-foreground">课程类别</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">100+</p>
          <p className="text-muted-foreground">合作机构</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">98%</p>
          <p className="text-muted-foreground">学员好评</p>
        </div>
      </div>
    </section>
  )
}
