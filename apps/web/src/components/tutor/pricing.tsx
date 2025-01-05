import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, Users } from 'lucide-react'

export function TutorPricing({ tutorId }: { tutorId: string }) {
  // TODO: 从API获取导师价格信息
  const pricing = {
    regular: {
      price: 200,
      duration: 60,
      description: '一对一个性化辅导，包含课前预习资料和课后作业点评'
    },
    trial: {
      price: 50,
      duration: 30,
      description: '体验课程，了解教学风格和互动方式'
    },
    group: {
      price: 100,
      duration: 90,
      minStudents: 3,
      maxStudents: 6,
      description: '小组研讨课，与其他学员共同学习和交流'
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">课程价格</h2>

      {/* 常规课程 */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">一对一课程</h3>
            <Badge>最受欢迎</Badge>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">¥{pricing.regular.price}</span>
            <span className="text-muted-foreground">/课时</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{pricing.regular.duration}分钟</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {pricing.regular.description}
          </p>
          <Button className="w-full">预约课程</Button>
        </div>

        {/* 试听课程 */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">体验课程</h3>
            <Badge variant="outline">优惠价</Badge>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">¥{pricing.trial.price}</span>
            <span className="text-muted-foreground">/次</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{pricing.trial.duration}分钟</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {pricing.trial.description}
          </p>
          <Button variant="outline" className="w-full">
            预约体验课
          </Button>
        </div>

        {/* 小组课程 */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">小组课程</h3>
            <Badge variant="secondary">性价比之选</Badge>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">¥{pricing.group.price}</span>
            <span className="text-muted-foreground">/人/课时</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{pricing.group.duration}分钟</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {pricing.group.minStudents}-{pricing.group.maxStudents}人
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {pricing.group.description}
          </p>
          <Button variant="outline" className="w-full">
            加入小组课
          </Button>
        </div>

        {/* 退款政策 */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-2">课程保障</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              24小时内可免费取消课程
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              首次体验课不满意可全额退款
            </li>
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              课程结束后7天内可申请售后
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
