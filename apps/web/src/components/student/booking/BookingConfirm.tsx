import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { format, addMinutes } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { getTutorAvailability, createBooking } from '@/lib/api/student';
import { useToast } from '@/components/ui/use-toast';

interface BookingConfirmProps {
  tutorId: string;
}

export function BookingConfirm({ tutorId }: BookingConfirmProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [confirmDialog, setConfirmDialog] = useState(false);

  // 获取导师信息和可用时间
  const { data: availability, isLoading } = useQuery(
    ['tutorAvailability', tutorId, selectedDate],
    () => getTutorAvailability(tutorId, selectedDate),
    {
      enabled: !!selectedDate,
    }
  );

  // 创建预约
  const bookingMutation = useMutation(createBooking, {
    onSuccess: (result) => {
      toast({
        title: '预约成功',
        description: '导师将收到您的预约请求，请等待确认',
      });
      router.push(`/bookings/${result.id}`);
    },
    onError: () => {
      toast({
        title: '预约失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    },
  });

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedSlot) return;

    bookingMutation.mutate({
      tutorId,
      date: selectedDate,
      startTime: selectedSlot,
      duration: 60, // 默认1小时
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 导师信息卡片 */}
        <Card className="p-6 md:col-span-1">
          {availability?.tutor && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={availability.tutor.avatar}
                  alt={availability.tutor.name}
                  className="w-16 h-16"
                />
                <div>
                  <h3 className="font-medium">
                    {availability.tutor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {availability.tutor.title}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">教学科目</h4>
                <div className="flex flex-wrap gap-1">
                  {availability.tutor.subjects.map((subject) => (
                    <Badge key={subject} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">课时费用</h4>
                <p className="text-2xl font-bold">
                  ¥{availability.tutor.pricePerHour}
                  <span className="text-sm text-muted-foreground">
                    /小时
                  </span>
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* 日期和时间选择 */}
        <Card className="p-6 md:col-span-2">
          <Tabs defaultValue="calendar">
            <TabsList className="mb-4">
              <TabsTrigger value="calendar">日历视图</TabsTrigger>
              <TabsTrigger value="list">列表视图</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={zhCN}
                disabled={(date) => {
                  return date < new Date() || !availability?.availableDates.includes(format(date, 'yyyy-MM-dd'));
                }}
              />

              {selectedDate && (
                <div className="grid grid-cols-4 gap-2">
                  {availability?.slots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? 'default' : 'outline'}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {format(new Date(`2000-01-01T${slot}`), 'HH:mm')}
                    </Button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {availability?.availableDates.map((date) => (
                  <div key={date} className="space-y-2">
                    <h4 className="font-medium">
                      {format(new Date(date), 'MM月dd日 EEEE', {
                        locale: zhCN,
                      })}
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {availability.slots.map((slot) => (
                        <Button
                          key={`${date}-${slot}`}
                          variant={
                            selectedDate?.toDateString() ===
                              new Date(date).toDateString() &&
                            selectedSlot === slot
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() => {
                            setSelectedDate(new Date(date));
                            setSelectedSlot(slot);
                          }}
                        >
                          {format(new Date(`2000-01-01T${slot}`), 'HH:mm')}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setConfirmDialog(true)}
            >
              确认预约
            </Button>
          </div>
        </Card>
      </div>

      {/* 确认对话框 */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认预约信息</DialogTitle>
            <DialogDescription>
              请确认以下预约信息无误
            </DialogDescription>
          </DialogHeader>

          {selectedDate && selectedSlot && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">上课时间</h4>
                <p>
                  {format(selectedDate, 'yyyy年MM月dd日 EEEE', {
                    locale: zhCN,
                  })}
                </p>
                <p>
                  {format(
                    new Date(`2000-01-01T${selectedSlot}`),
                    'HH:mm',
                  )}
                  -
                  {format(
                    addMinutes(
                      new Date(`2000-01-01T${selectedSlot}`),
                      60,
                    ),
                    'HH:mm',
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">费用明细</h4>
                <p>
                  课时费：¥
                  {availability?.tutor.pricePerHour}
                  /小时 × 1小时
                </p>
                <p className="text-lg font-bold">
                  总计：¥{availability?.tutor.pricePerHour}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(false)}
            >
              返回修改
            </Button>
            <Button onClick={handleConfirmBooking}>
              确认预约
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
