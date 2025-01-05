export enum TutorDegree {
  HIGH_SCHOOL = 'High School Diploma',
  ASSOCIATE = 'Associate Degree',
  BACHELOR = 'Bachelor\'s Degree',
  MASTER = 'Master\'s Degree',
  DOCTORATE = 'Doctorate',
  OTHER = 'Other'
}

export enum StudentLevel {
  BEGINNER = 'Beginner',
  HIGH_BEGINNER = 'High Beginner',
  INTERMEDIATE = 'Intermediate',
  HIGH_INTERMEDIATE = 'High Intermediate',
  ADVANCED = 'Advanced',
  MASTER = 'Master'
}

export enum TeachingLanguage {
  ENGLISH = 'English',
  CHINESE = 'Chinese',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  RUSSIAN = 'Russian',
  ARABIC = 'Arabic',
  PORTUGUESE = 'Portuguese',
  ITALIAN = 'Italian',
  HINDI = 'Hindi',
  VIETNAMESE = 'Vietnamese',
  THAI = 'Thai',
  INDONESIAN = 'Indonesian'
}

export interface AvailabilitySchedule {
  dayOfWeek: number // 0-6, 0 represents Sunday
  timeSlots: Array<{
    startTime: string // Format: "HH:mm"
    endTime: string
    isAvailable: boolean
  }>
}

export interface PriceRange {
  min: number
  max: number
}

export interface TutorSearchFilters {
  subjects?: string[] // Subject IDs
  teachingLanguages?: TeachingLanguage[]
  degree?: TutorDegree[]
  studentLevels?: StudentLevel[]
  priceRange?: PriceRange
  availability?: {
    daysOfWeek: number[]
    timeRange?: {
      startTime: string
      endTime: string
    }
  }
  ageRange?: {
    min: number
    max: number
  }
  rating?: number
  hasVideo?: boolean
  isOnline?: boolean
  country?: string
  timezone?: string
}
