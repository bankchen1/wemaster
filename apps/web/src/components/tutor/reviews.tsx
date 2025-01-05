import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Flag, ThumbsUp, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export function TutorReviews({ tutorId }: { tutorId: string }) {
  // TODO: 从API获取评价数据
  const reviews = {
    summary: {
      average: 4.9,
      total: 128,
      distribution: {
        5: 100,
        4: 20,
        3: 5,
        2: 2,
        1: 1
      }
    },
    items: [
      {
        id: '1',
        user: {
          name: '张同学',
          avatar: '/images/avatars/student-1.jpg'
        },
        rating: 5,
        date: '2023-12-20',
        content: '老师非常耐心，讲解详细，课程内容针对性强。通过一个月的学习，我的口语水平有了明显提升。',
        course: '商务英语口语',
        likes: 12,
        replies: 2
      },
      {
        id: '2',
        user: {
          name: '李同学',
          avatar: '/images/avatars/student-2.jpg'
        },
        rating: 4,
        date: '2023-12-15',
        content: '课程质量很好，老师备课充分。建议可以增加一些课后练习材料。',
        course: '雅思备考',
        likes: 8,
        replies: 1
      }
      // 更多评价...
    ]
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">学员评价</h2>
        <span className="text-muted-foreground">
          共 {reviews.summary.total} 条评价
        </span>
      </div>

      {/* 评分统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{reviews.summary.average}</div>
            <div className="flex gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(reviews.summary.average)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            {Object.entries(reviews.summary.distribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-3">{rating}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${(count / reviews.summary.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* 评价指标 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-2xl font-bold">98%</div>
            <div className="text-sm text-muted-foreground">准时率</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-muted-foreground">完课率</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">4.8</div>
            <div className="text-sm text-muted-foreground">教学质量</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">4.9</div>
            <div className="text-sm text-muted-foreground">互动效果</div>
          </div>
        </div>
      </div>

      {/* 评价列表 */}
      <div className="space-y-6">
        {reviews.items.map((review) => (
          <div key={review.id} className="border-t pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Image
                  src={review.user.avatar}
                  alt={review.user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.user.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {review.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.course}
                    </span>
                  </div>
                </div>
              </div>

              {/* 申诉按钮 */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Flag className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>申诉评价</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium mb-2">申诉原因：</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="radio" name="reason" />
                          <span>评价内容与事实不符</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="reason" />
                          <span>评价内容含有不当言论</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="reason" />
                          <span>其他原因</span>
                        </label>
                      </div>
                    </div>
                    <Textarea
                      placeholder="请详细描述申诉原因..."
                      className="min-h-[100px]"
                    />
                    <div className="text-sm text-muted-foreground">
                      申诉将在48小时内处理，请耐心等待
                    </div>
                    <Button className="w-full">提交申诉</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <p className="mt-4 text-muted-foreground">{review.content}</p>

            {/* 评价操作 */}
            <div className="mt-4 flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ThumbsUp className="h-4 w-4 mr-1" />
                有帮助 ({review.likes})
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MessageCircle className="h-4 w-4 mr-1" />
                回复 ({review.replies})
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline">查看更多评价</Button>
      </div>
    </Card>
  )
}
