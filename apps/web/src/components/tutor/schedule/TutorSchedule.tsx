import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTutorAvailability, bookSession } from '@/lib/api/tutors';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface TutorScheduleProps {
  tutorId: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

export function TutorSchedule({ tutorId }: TutorScheduleProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability(selectedDate);
    }
  }, [selectedDate, tutorId]);

  async function loadAvailability(date: Date) {
    try {
      setLoading(true);
      const data = await getTutorAvailability(tutorId, date);
      setSchedule(data);
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tutor\'s availability',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleBookSession = async () => {
    if (!selectedDate || !selectedSlot) {
      toast({
        title: 'Error',
        description: 'Please select a date and time slot',
        variant: 'destructive',
      });
      return;
    }

    try {
      setBookingInProgress(true);
      await bookSession({
        tutorId,
        date: selectedDate.toISOString(),
        slotId: selectedSlot,
        duration: parseInt(selectedDuration),
      });

      toast({
        title: 'Success',
        description: 'Session booked successfully!',
      });

      // Reset selection
      setSelectedSlot(null);
      loadAvailability(selectedDate);
    } catch (error) {
      console.error('Failed to book session:', error);
      toast({
        title: 'Error',
        description: 'Failed to book session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBookingInProgress(false);
    }
  };

  const isSlotAvailable = (slot: TimeSlot, duration: number) => {
    if (!slot.isAvailable) return false;
    
    const slotIndex = schedule
      .find(day => day.date === selectedDate?.toISOString().split('T')[0])
      ?.slots.findIndex(s => s.id === slot.id);
    
    if (slotIndex === undefined) return false;

    const requiredSlots = duration / 30; // Assuming each slot is 30 minutes
    const daySchedule = schedule.find(
      day => day.date === selectedDate?.toISOString().split('T')[0]
    );

    if (!daySchedule) return false;

    for (let i = slotIndex; i < slotIndex + requiredSlots; i++) {
      if (!daySchedule.slots[i]?.isAvailable) return false;
    }

    return true;
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Book a Session</h2>

      <div className="space-y-6">
        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
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
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Date
          </label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            disabled={(date) => {
              // Disable past dates and dates more than 2 months in the future
              const now = new Date();
              const twoMonthsFromNow = new Date();
              twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
              return date < now || date > twoMonthsFromNow;
            }}
          />
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Available Time Slots
          </label>
          {loading ? (
            <div className="text-center py-4">Loading available slots...</div>
          ) : schedule.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No available slots for the selected date
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {schedule
                .find(day => day.date === selectedDate?.toISOString().split('T')[0])
                ?.slots.map((slot) => {
                  const available = isSlotAvailable(slot, parseInt(selectedDuration));
                  return (
                    <Button
                      key={slot.id}
                      variant={selectedSlot === slot.id ? 'default' : 'outline'}
                      className={`w-full ${!available && 'opacity-50 cursor-not-allowed'}`}
                      disabled={!available}
                      onClick={() => setSelectedSlot(slot.id)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(slot.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Booking Button */}
        <Button
          className="w-full"
          disabled={!selectedSlot || bookingInProgress}
          onClick={handleBookSession}
        >
          {bookingInProgress ? 'Booking...' : 'Book Session'}
        </Button>

        {/* Additional Information */}
        <div className="text-sm text-gray-500">
          <p>• All times are shown in your local timezone</p>
          <p>• Sessions can be cancelled up to 24 hours before the start time</p>
          <p>• Payment will be processed after booking confirmation</p>
        </div>
      </div>
    </Card>
  );
}
