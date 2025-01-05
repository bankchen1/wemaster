import React, { useState } from 'react';
import { Command } from 'cmdk';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

// 国家代码数据
const countries: Country[] = [
  { name: 'China', code: 'CN', dialCode: '86', flag: '🇨🇳' },
  { name: 'United States', code: 'US', dialCode: '1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '44', flag: '🇬🇧' },
  { name: 'Japan', code: 'JP', dialCode: '81', flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', dialCode: '82', flag: '🇰🇷' },
  { name: 'Singapore', code: 'SG', dialCode: '65', flag: '🇸🇬' },
  { name: 'Australia', code: 'AU', dialCode: '61', flag: '🇦🇺' },
  { name: 'Canada', code: 'CA', dialCode: '1', flag: '🇨🇦' },
  { name: 'Germany', code: 'DE', dialCode: '49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '33', flag: '🇫🇷' },
  // ... 可以添加更多国家
];

interface CountryCodeSelectProps {
  value: Country;
  onChange: (country: Country) => void;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.dialCode.includes(search) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[120px] justify-between"
        >
          <span className="flex items-center gap-2">
            <span>{value.flag}</span>
            <span>+{value.dialCode}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Input
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-0 focus-visible:ring-0"
            />
          </div>
          <ScrollArea className="h-[300px]">
            {filteredCountries.map((country) => (
              <Command.Item
                key={country.code}
                onSelect={() => {
                  onChange(country);
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent"
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <span className="text-muted-foreground">
                  +{country.dialCode}
                </span>
                {country.code === value.code && (
                  <Check className="h-4 w-4" />
                )}
              </Command.Item>
            ))}
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
