import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { format, addMinutes, isBefore, isAfter } from 'date-fns';
import { Clock, Video, Users, X } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  studentName?: string;
  meetingType: 'video' | 'audio';
  subject?: string;
}

interface TutorScheduleProps {
  tutorId: string;
  tutorName: string;
  timeSlots: TimeSlot[];
  onScheduleUpdate: (slots: TimeSlot[]) => void;
}

export const TutorSchedule: React.FC<TutorScheduleProps> = ({
  tutorId,
  tutorName,
  timeSlots,
  onScheduleUpdate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const { toast } = useToast();

  const availableTimeSlots = timeSlots.filter(
    (slot) =>
      format(slot.startTime, 'yyyy-MM-dd') ===
        format(selectedDate, 'yyyy-MM-dd') && !slot.isBooked
  );

  const bookedTimeSlots = timeSlots.filter(
    (slot) =>
      format(slot.startTime, 'yyyy-MM-dd') ===
        format(selectedDate, 'yyyy-MM-dd') && slot.isBooked
  );

  const handleAddTimeSlot = async (startTime: Date) => {
    const endTime = addMinutes(startTime, parseInt(selectedDuration));
    
    // 检查时间段是否有冲突
    const hasConflict = timeSlots.some(
      (slot) =>
        (isBefore(slot.startTime, endTime) &&
          isAfter(slot.endTime, startTime)) ||
        (isBefore(startTime, slot.endTime) &&
          isAfter(endTime, slot.startTime))
    );

    if (hasConflict) {
      toast({
        title: 'Time Slot Conflict',
        description: 'This time slot overlaps with existing slots',
        variant: 'destructive',
      });
      return;
    }

    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      startTime,
      endTime,
      isBooked: false,
      meetingType: 'video',
    };

    try {
      // 调用 API 添加时间段
      const response = await fetch('/api/tutor/time-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId,
          timeSlot: newSlot,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add time slot');
      }

      const updatedSlots = [...timeSlots, newSlot];
      onScheduleUpdate(updatedSlots);
      toast({
        title: 'Success',
        description: 'Time slot added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add time slot',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTimeSlot = async (slotId: string) => {
    try {
      // 调用 API 删除时间段
      const response = await fetch(`/api/tutor/time-slots/${slotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove time slot');
      }

      const updatedSlots = timeSlots.filter(
        (slot) => slot.id !== slotId
      );
      onScheduleUpdate(updatedSlots);
      toast({
        title: 'Success',
        description: 'Time slot removed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove time slot',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>
                Manage your available time slots for tutoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Session Duration
                </label>
                <Select
                  value={selectedDuration}
                  onValueChange={setSelectedDuration}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={() => handleAddTimeSlot(new Date())}
              >
                Add Time Slot
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Time Slots</CardTitle>
              <CardDescription>
                {format(selectedDate, 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableTimeSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No available time slots for this date
                  </p>
                ) : (
                  availableTimeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Clock className="h-5 w-5" />
                        <div>
                          <p className="font-medium">
                            {format(slot.startTime, 'h:mm a')} -{' '}
                            {format(slot.endTime, 'h:mm a')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              addMinutes(
                                slot.startTime,
                                -new Date().getTimezoneOffset()
                              ),
                              'zzz'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {slot.meetingType === 'video' ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTimeSlot(slot.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booked Sessions</CardTitle>
              <CardDescription>
                Your scheduled tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookedTimeSlots.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No booked sessions for this date
                  </p>
                ) : (
                  bookedTimeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-muted"
                    >
                      <div className="flex items-center space-x-4">
                        <Clock className="h-5 w-5" />
                        <div>
                          <p className="font-medium">
                            {format(slot.startTime, 'h:mm a')} -{' '}
                            {format(slot.endTime, 'h:mm a')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            with {slot.studentName}
                          </p>
                          {slot.subject && (
                            <Badge className="mt-1">
                              {slot.subject}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {slot.meetingType === 'video' ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
