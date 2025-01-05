import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageFilterProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

export function LanguageFilter({
  selectedLanguages,
  onLanguagesChange,
}: LanguageFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = LANGUAGES.filter((language) =>
    language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    language.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLanguage = (code: string) => {
    const newSelected = selectedLanguages.includes(code)
      ? selectedLanguages.filter((lang) => lang !== code)
      : [...selectedLanguages, code];
    onLanguagesChange(newSelected);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search languages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Selected Languages */}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((code) => {
            const language = LANGUAGES.find((lang) => lang.code === code);
            if (!language) return null;
            return (
              <Badge
                key={code}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleLanguage(code)}
              >
                {language.name}
                <span className="ml-1 text-gray-400">×</span>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Language List */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-1">
          {filteredLanguages.map((language) => {
            const isSelected = selectedLanguages.includes(language.code);
            return (
              <button
                key={language.code}
                onClick={() => toggleLanguage(language.code)}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100'
                )}
              >
                <div className="flex flex-col items-start">
                  <span>{language.name}</span>
                  <span className="text-xs opacity-70">
                    {language.nativeName}
                  </span>
                </div>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {filteredLanguages.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          No languages found
        </div>
      )}
    </div>
  );
}
