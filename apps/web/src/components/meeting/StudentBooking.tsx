import React, { useState } from 'react';
import Image from 'next/image';
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
import { format, addMinutes } from 'date-fns';
import {
  Clock,
  Video,
  Users,
  Star,
  BookOpen,
  Globe,
  MessageSquare,
} from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
  meetingType: 'video' | 'audio';
}

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  rating: number;
  totalReviews: number;
  languages: string[];
  hourlyRate: number;
  introduction: string;
  timeSlots: TimeSlot[];
}

interface StudentBookingProps {
  tutor: Tutor;
  onBookingComplete: () => void;
}

export const StudentBooking: React.FC<StudentBookingProps> = ({
  tutor,
  onBookingComplete,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );
  const [meetingType, setMeetingType] = useState<'video' | 'audio'>(
    'video'
  );
  const { toast } = useToast();

  const availableTimeSlots = tutor.timeSlots.filter(
    (slot) =>
      format(slot.startTime, 'yyyy-MM-dd') ===
        format(selectedDate, 'yyyy-MM-dd') && !slot.isBooked
  );

  const handleBookSession = async () => {
    if (!selectedTimeSlot || !selectedSubject) {
      toast({
        title: 'Incomplete Booking',
        description: 'Please select a time slot and subject',
        variant: 'destructive',
      });
      return;
    }

    try {
      // 调用 API 预约课程
      const response = await fetch('/api/student/book-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorId: tutor.id,
          timeSlotId: selectedTimeSlot.id,
          subject: selectedSubject,
          meetingType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book session');
      }

      toast({
        title: 'Success',
        description: 'Session booked successfully',
      });
      onBookingComplete();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to book session',
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
              <CardTitle>Tutor Profile</CardTitle>
              <CardDescription>
                Learn more about your tutor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={tutor.avatar}
                    alt={tutor.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{tutor.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>
                      {tutor.rating} ({tutor.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Subjects:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Languages:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tutor.languages.map((language) => (
                    <Badge key={language} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Introduction:</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tutor.introduction}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">
                  ${tutor.hourlyRate}/hour
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
              <CardDescription>
                Choose your preferred time and subject
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Meeting Type
                    </label>
                    <Select
                      value={meetingType}
                      onValueChange={(value: 'video' | 'audio') =>
                        setMeetingType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center">
                            <Video className="h-4 w-4 mr-2" />
                            Video Call
                          </div>
                        </SelectItem>
                        <SelectItem value="audio">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Audio Call
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Available Time Slots</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableTimeSlots.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground py-4">
                      No available time slots for this date
                    </p>
                  ) : (
                    availableTimeSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={
                          selectedTimeSlot?.id === slot.id
                            ? 'default'
                            : 'outline'
                        }
                        className="h-auto py-4"
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        <div className="text-center">
                          <div className="font-medium">
                            {format(slot.startTime, 'h:mm a')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(
                              addMinutes(
                                slot.endTime,
                                -slot.startTime.getTimezoneOffset()
                              ),
                              'h:mm a'
                            )}
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </div>

              {selectedTimeSlot && (
                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Selected Time</p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedTimeSlot.startTime, 'MMMM d, yyyy')}
                        {' • '}
                        {format(selectedTimeSlot.startTime, 'h:mm a')} -{' '}
                        {format(selectedTimeSlot.endTime, 'h:mm a')}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleBookSession}
                      disabled={!selectedSubject}
                    >
                      Book Session
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
