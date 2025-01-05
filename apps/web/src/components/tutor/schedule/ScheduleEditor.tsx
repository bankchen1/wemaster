import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TimeSlot {
  start: string;
  end: string;
  status: 'available' | 'unavailable' | 'booked';
}

interface ScheduleEditorProps {
  initialSchedule?: Record<string, TimeSlot[]>;
  timezone?: string;
  onChange?: (schedule: Record<string, TimeSlot[]>) => void;
  readOnly?: boolean;
  showBookingStatus?: boolean;
}

const TIMEZONES = [
  { value: 'UTC+8', label: '(UTC+8)北京, 重庆, 香港' },
  { value: 'UTC+9', label: '(UTC+9)东京, 首尔' },
  { value: 'UTC+7', label: '(UTC+7)曼谷, 雅加达' },
];

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function ScheduleEditor({
  initialSchedule = {},
  timezone = 'UTC+8',
  onChange,
  readOnly = false,
  showBookingStatus = false,
}: ScheduleEditorProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedule, setSchedule] = useState<Record<string, TimeSlot[]>>(initialSchedule);
  const [isDetailView, setIsDetailView] = useState(false);

  // 生成周视图的日期
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i)
  );

  // 处理时间槽选择
  const handleTimeSlotClick = (date: Date, time: string) => {
    if (readOnly) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const currentSlots = schedule[dateStr] || [];
    const timeSlot = `${time}`;

    // 查找是否已存在该时间段
    const existingSlotIndex = currentSlots.findIndex(
      (slot) => slot.start === timeSlot
    );

    let newSlots;
    if (existingSlotIndex >= 0) {
      // 如果已存在，则删除
      newSlots = currentSlots.filter((_, index) => index !== existingSlotIndex);
    } else {
      // 如果不存在，则添加
      newSlots = [
        ...currentSlots,
        {
          start: timeSlot,
          end: format(addMinutes(parseISO(`${dateStr}T${timeSlot}`), 30), 'HH:mm'),
          status: 'available',
        },
      ].sort((a, b) => a.start.localeCompare(b.start));
    }

    const newSchedule = {
      ...schedule,
      [dateStr]: newSlots,
    };

    setSchedule(newSchedule);
    onChange?.(newSchedule);
  };

  // 获取时间槽状态
  const getTimeSlotStatus = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slots = schedule[dateStr] || [];
    const slot = slots.find((s) => s.start === time);
    return slot?.status || null;
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedTimezone}
            onValueChange={setSelectedTimezone}
            disabled={readOnly}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDetailView(!isDetailView)}
          >
            {isDetailView ? '周视图' : '详细视图'}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
          >
            上一周
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(new Date())}
          >
            本周
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            下一周
          </Button>
        </div>
      </div>

      {/* 日历视图 */}
      <Card className="p-4">
        <div className="grid grid-cols-8 gap-px bg-muted">
          {/* 时间列 */}
          <div className="bg-background p-2 text-center text-sm">
            {selectedTimezone}
          </div>
          {/* 星期标题 */}
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="bg-background p-2 text-center"
            >
              <div className="font-medium">
                {format(day, 'EEEE', { locale: zhCN })}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(day, 'MM/dd')}
              </div>
            </div>
          ))}

          {/* 时间格子 */}
          {TIME_SLOTS.map((time) => (
            <>
              <div
                key={`time-${time}`}
                className="bg-background p-2 text-right text-sm text-muted-foreground"
              >
                {time}
              </div>
              {weekDays.map((day) => {
                const status = getTimeSlotStatus(day, time);
                return (
                  <button
                    key={`${day.toISOString()}-${time}`}
                    className={cn(
                      'relative h-8 border-t transition-colors',
                      !readOnly && 'hover:bg-accent',
                      status === 'available' && 'bg-green-100',
                      status === 'booked' && 'bg-purple-100',
                      status === 'unavailable' && 'bg-orange-100'
                    )}
                    onClick={() => handleTimeSlotClick(day, time)}
                    disabled={readOnly || status === 'booked'}
                  />
                );
              })}
            </>
          ))}
        </div>
      </Card>

      {/* 图例 */}
      {showBookingStatus && (
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded bg-green-100" />
            <span>可预约</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded bg-orange-100" />
            <span>不可用</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded bg-purple-100" />
            <span>已预约</span>
          </div>
        </div>
      )}
    </div>
  );
}
