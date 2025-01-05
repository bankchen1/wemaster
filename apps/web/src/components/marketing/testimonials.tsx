import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: '张明',
    role: '高中生',
    avatar: '/images/avatars/student-1.jpg',
    content: '通过WeMaster，我找到了非常专业的数学导师。一对一的辅导让我的成绩有了显著提升，现在我对解题更有信心了！',
    rating: 5
  },
  {
    name: 'Sarah Johnson',
    role: '英语教师',
    avatar: '/images/avatars/tutor-1.jpg',
    content: '作为一名教师，我很喜欢WeMaster平台提供的教学工具。互动白板和实时反馈系统让我的教学更加生动有效。',
    rating: 5
  },
  {
    name: '李华',
    role: '在职人士',
    avatar: '/images/avatars/student-2.jpg',
    content: '工作之余学习变得更加便捷，平台的灵活排课系统让我能够根据自己的时间安排学习。课程质量也很高！',
    rating: 5
  },
  {
    name: 'David Miller',
    role: '计算机科学导师',
    avatar: '/images/avatars/tutor-2.jpg',
    content: '平台不仅提供了优秀的教学环境，还帮助我接触到来自世界各地的学生。这是一个非常棒的教学平台！',
    rating: 5
  }
]

export function Testimonials() {
  return (
    <section className="bg-muted/50 py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            用户心声
          </h2>
          <p className="text-lg text-muted-foreground">
            来自全球用户的真实评价，见证学习的力量
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-background">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "{testimonial.content}"
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-4">
                  <div className="relative h-10 w-10">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 统计数字 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            信任度 98%
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            超过50,000名用户选择WeMaster作为他们的学习伙伴
          </p>
        </div>
      </div>
    </section>
  )
}
