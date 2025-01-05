import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TutorSchedule({ tutorId }: { tutorId: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>()

  // TODO: 从API获取导师课程时间表
  const schedule = {
    availableTimeSlots: [
      { time: '09:00', available: true },
      { time: '10:00', available: false },
      { time: '11:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: false },
      { time: '17:00', available: true },
      { time: '19:00', available: true },
      { time: '20:00', available: true }
    ],
    timeZone: 'GMT+8',
    workingDays: [1, 2, 3, 4, 5, 6], // 周一到周六
    unavailableDates: ['2025-01-10', '2025-01-15'] // 特殊休息日
  }

  // 判断日期是否可选
  const isDateAvailable = (date: Date) => {
    const day = date.getDay()
    const dateStr = date.toISOString().split('T')[0]
    return (
      schedule.workingDays.includes(day) &&
      !schedule.unavailableDates.includes(dateStr)
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">预约课程</h2>

      {/* 课程类型选择 */}
      <div className="space-y-4 mb-6">
        <label className="text-sm font-medium">课程类型</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="选择课程类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-on-1">一对一课程</SelectItem>
            <SelectItem value="trial">体验课程</SelectItem>
            <SelectItem value="group">小组课程</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 日期选择 */}
      <div className="space-y-4 mb-6">
        <label className="text-sm font-medium">选择日期</label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(date) => !isDateAvailable(date)}
          className="rounded-md border"
        />
      </div>

      {/* 时间段选择 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">可用时段</label>
          <span className="text-sm text-muted-foreground">
            时区：{schedule.timeZone}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {schedule.availableTimeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant={selectedTimeSlot === slot.time ? 'default' : 'outline'}
              className={cn(
                'flex items-center gap-2',
                !slot.available && 'opacity-50 cursor-not-allowed'
              )}
              disabled={!slot.available}
              onClick={() => setSelectedTimeSlot(slot.time)}
            >
              <Clock className="h-4 w-4" />
              {slot.time}
            </Button>
          ))}
        </div>
      </div>

      {/* 预约按钮 */}
      <Button className="w-full mt-6" disabled={!date || !selectedTimeSlot}>
        确认预约
      </Button>

      {/* 预约说明 */}
      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          可提前30天预约课程
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          课前24小时可免费取消
        </p>
      </div>
    </Card>
  )
}
