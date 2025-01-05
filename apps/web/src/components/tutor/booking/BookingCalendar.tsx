import { useState, useEffect } from 'react';
import { format, addWeeks, isBefore, isAfter } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScheduleEditor } from '../schedule/ScheduleEditor';
import { createBooking } from '@/lib/api/booking';
import { useToast } from '@/components/ui/use-toast';

interface BookingCalendarProps {
  tutorId: string;
  schedule: any;
  pricing: {
    trialPrice: number;
    basicPrice: number;
    packages: Array<{
      lessons: number;
      discount: number;
    }>;
  };
}

export function BookingCalendar({
  tutorId,
  schedule,
  pricing,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [isFirstLesson, setIsFirstLesson] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const { toast } = useToast();

  // 计算实际价格
  const calculatePrice = () => {
    const basePrice = isFirstLesson ? pricing.trialPrice : pricing.basicPrice;
    if (!selectedPackage) return basePrice;

    const package = pricing.packages.find((p) => p.lessons === selectedPackage);
    if (!package) return basePrice;

    return basePrice * (1 - package.discount / 100);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      await createBooking({
        tutorId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        packageLessons: selectedPackage,
        isTrialLesson: isFirstLesson,
        price: calculatePrice(),
      });

      toast({
        title: '预约成功',
        description: '导师会尽快确认您的预约',
      });
      setBookingDialog(false);
    } catch (error) {
      toast({
        title: '预约失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 日历选择器 */}
      <Card className="p-4">
        <ScheduleEditor
          initialSchedule={schedule}
          readOnly
          showBookingStatus
          onChange={(date, time) => {
            setSelectedDate(date);
            setSelectedTime(time);
            setBookingDialog(true);
          }}
        />
      </Card>

      {/* 预约确认对话框 */}
      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认预约</DialogTitle>
            <DialogDescription>
              请确认以下预约信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">日期</div>
                <div className="font-medium">
                  {selectedDate && format(selectedDate, 'yyyy年MM月dd日')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">时间</div>
                <div className="font-medium">{selectedTime}</div>
              </div>
            </div>

            {/* 课程类型选择 */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">课程类型</div>
              <div className="flex space-x-2">
                <Button
                  variant={isFirstLesson ? 'default' : 'outline'}
                  onClick={() => setIsFirstLesson(true)}
                >
                  试课
                  <span className="ml-1 text-sm">
                    (¥{pricing.trialPrice})
                  </span>
                </Button>
                <Button
                  variant={!isFirstLesson ? 'default' : 'outline'}
                  onClick={() => setIsFirstLesson(false)}
                >
                  常规课
                  <span className="ml-1 text-sm">
                    (¥{pricing.basicPrice})
                  </span>
                </Button>
              </div>
            </div>

            {/* 套餐选择 */}
            {!isFirstLesson && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">套餐选择</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={!selectedPackage ? 'default' : 'outline'}
                    onClick={() => setSelectedPackage(null)}
                  >
                    单节购买
                  </Button>
                  {pricing.packages.map((pkg) => (
                    <Button
                      key={pkg.lessons}
                      variant={selectedPackage === pkg.lessons ? 'default' : 'outline'}
                      onClick={() => setSelectedPackage(pkg.lessons)}
                    >
                      {pkg.lessons}节课 ({pkg.discount}%折扣)
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 价格显示 */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">费用</div>
              <div className="text-lg font-bold">¥{calculatePrice()}</div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog(false)}>
              取消
            </Button>
            <Button onClick={handleBooking}>确认预约</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
