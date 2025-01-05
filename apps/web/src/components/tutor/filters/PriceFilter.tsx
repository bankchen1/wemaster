import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceFilter({
  min,
  max,
  value,
  onChange,
}: PriceFilterProps) {
  const [localValue, setLocalValue] = useState(value);
  const [inputMin, setInputMin] = useState(value[0].toString());
  const [inputMax, setInputMax] = useState(value[1].toString());

  useEffect(() => {
    setLocalValue(value);
    setInputMin(value[0].toString());
    setInputMax(value[1].toString());
  }, [value]);

  const handleSliderChange = (newValue: number[]) => {
    const [newMin, newMax] = newValue;
    setLocalValue([newMin, newMax]);
    setInputMin(newMin.toString());
    setInputMax(newMax.toString());
    onChange([newMin, newMax]);
  };

  const handleInputChange = (type: 'min' | 'max', inputValue: string) => {
    const numValue = parseInt(inputValue) || 0;
    
    if (type === 'min') {
      setInputMin(inputValue);
      if (numValue >= min && numValue <= localValue[1]) {
        const newValue: [number, number] = [numValue, localValue[1]];
        setLocalValue(newValue);
        onChange(newValue);
      }
    } else {
      setInputMax(inputValue);
      if (numValue <= max && numValue >= localValue[0]) {
        const newValue: [number, number] = [localValue[0], numValue];
        setLocalValue(newValue);
        onChange(newValue);
      }
    }
  };

  const handleInputBlur = (type: 'min' | 'max') => {
    const minValue = parseInt(inputMin) || min;
    const maxValue = parseInt(inputMax) || max;

    let newMin = Math.max(min, Math.min(minValue, maxValue));
    let newMax = Math.min(max, Math.max(minValue, maxValue));

    setInputMin(newMin.toString());
    setInputMax(newMax.toString());
    setLocalValue([newMin, newMax]);
    onChange([newMin, newMax]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="min-price">Min Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              id="min-price"
              type="number"
              min={min}
              max={max}
              value={inputMin}
              onChange={(e) => handleInputChange('min', e.target.value)}
              onBlur={() => handleInputBlur('min')}
              className="pl-7"
            />
          </div>
        </div>
        <div className="flex-1">
          <Label htmlFor="max-price">Max Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              id="max-price"
              type="number"
              min={min}
              max={max}
              value={inputMax}
              onChange={(e) => handleInputChange('max', e.target.value)}
              onBlur={() => handleInputBlur('max')}
              className="pl-7"
            />
          </div>
        </div>
      </div>

      <Slider
        min={min}
        max={max}
        step={5}
        value={localValue}
        onValueChange={handleSliderChange}
        className="mt-6"
      />

      <div className="flex justify-between text-sm text-gray-500">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
}
