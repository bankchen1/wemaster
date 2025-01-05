import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface TimeSlot {
  start: string;
  end: string;
}

interface AvailabilityFilterProps {
  value: {
    days: number[];
    timeSlots: TimeSlot[];
  };
  onChange: (value: { days: number[]; timeSlots: TimeSlot[] }) => void;
}

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const TIME_SLOTS: TimeSlot[] = [
  { start: '00:00', end: '06:00' },
  { start: '06:00', end: '12:00' },
  { start: '12:00', end: '18:00' },
  { start: '18:00', end: '24:00' },
];

export function AvailabilityFilter({
  value,
  onChange,
}: AvailabilityFilterProps) {
  const [showWeekends, setShowWeekends] = useState(true);

  const toggleDay = (day: number) => {
    const newDays = value.days.includes(day)
      ? value.days.filter((d) => d !== day)
      : [...value.days, day];
    onChange({ ...value, days: newDays });
  };

  const toggleTimeSlot = (slot: TimeSlot) => {
    const isSelected = value.timeSlots.some(
      (s) => s.start === slot.start && s.end === slot.end
    );
    const newTimeSlots = isSelected
      ? value.timeSlots.filter(
          (s) => !(s.start === slot.start && s.end === slot.end)
        )
      : [...value.timeSlots, slot];
    onChange({ ...value, timeSlots: newTimeSlots });
  };

  const handleShowWeekendsChange = (checked: boolean) => {
    setShowWeekends(checked);
    if (!checked) {
      const weekdaysOnly = value.days.filter((day) => day !== 0 && day !== 6);
      onChange({ ...value, days: weekdaysOnly });
    }
  };

  const isTimeSlotSelected = (slot: TimeSlot) =>
    value.timeSlots.some(
      (s) => s.start === slot.start && s.end === slot.end
    );

  return (
    <div className="space-y-6">
      {/* Days Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>Days Available</Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="show-weekends" className="text-sm">
              Show Weekends
            </Label>
            <Switch
              id="show-weekends"
              checked={showWeekends}
              onCheckedChange={handleShowWeekendsChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS.filter(day => showWeekends || (day.value !== 0 && day.value !== 6)).map((day) => (
            <Button
              key={day.value}
              variant="outline"
              size="sm"
              className={cn(
                'h-10',
                value.days.includes(day.value) && 'bg-primary text-primary-foreground'
              )}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <Label className="mb-4 block">Time Slots</Label>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot) => (
            <Button
              key={`${slot.start}-${slot.end}`}
              variant="outline"
              className={cn(
                isTimeSlotSelected(slot) && 'bg-primary text-primary-foreground'
              )}
              onClick={() => toggleTimeSlot(slot)}
            >
              {formatTimeRange(slot)}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Summary */}
      {(value.days.length > 0 || value.timeSlots.length > 0) && (
        <div className="border-t pt-4">
          <Label className="mb-2 block">Selected Availability</Label>
          <div className="text-sm text-gray-600">
            {value.days.length > 0 && (
              <div className="mb-1">
                Days:{' '}
                {value.days
                  .sort()
                  .map((day) => DAYS.find((d) => d.value === day)?.label)
                  .join(', ')}
              </div>
            )}
            {value.timeSlots.length > 0 && (
              <div>
                Times:{' '}
                {value.timeSlots
                  .map((slot) => formatTimeRange(slot))
                  .join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeRange(slot: TimeSlot) {
  const formatTime = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    return `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`;
  };

  return `${formatTime(slot.start)} - ${formatTime(slot.end)}`;
}
