import { IsString, IsUrl, IsArray, IsNumber, IsBoolean, ValidateNested, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class PricingDto {
  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @IsNumber()
  @Min(0)
  trialRate: number;

  @IsNumber()
  @Min(0)
  groupRate: number;

  @IsNumber()
  @Min(2)
  @Max(10)
  groupSize: number;
}

class TimeSlotDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

class AvailabilityDto {
  @IsArray()
  @ArrayMinSize(1)
  weekdays: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[];

  @IsString()
  timezone: string;
}

class PreferencesDto {
  @IsBoolean()
  instantBooking: boolean;

  @IsNumber()
  @Min(1)
  minimumNotice: number;

  @IsString()
  cancellationPolicy: string;
}

export class CreateTutorProfileDto {
  @IsString()
  displayName: string;

  @IsString()
  title: string;

  @IsString()
  bio: string;

  @IsUrl()
  avatarUrl?: string;

  @IsUrl()
  videoIntro?: string;

  @IsArray()
  @ArrayMinSize(1)
  subjects: string[];

  @IsArray()
  @ArrayMinSize(1)
  levels: string[];

  @IsArray()
  @ArrayMinSize(1)
  languages: string[];

  @IsString()
  teachingStyle: string;

  @ValidateNested()
  @Type(() => PricingDto)
  pricing: PricingDto;

  @ValidateNested()
  @Type(() => AvailabilityDto)
  availability: AvailabilityDto;

  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;
}
