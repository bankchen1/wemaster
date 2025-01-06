import { IsEnum, IsString, IsNumber, IsOptional, IsDate, Min, Max } from 'class-validator';
import { LessonStatus } from '@wemaster/shared/types/lesson-status';

export class UpdateStatusDto {
  @IsEnum(LessonStatus)
  status: LessonStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class FeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class AppealDto {
  @IsString()
  reason: string;
}

export class RescheduleDto {
  @IsDate()
  startTime: Date;

  @IsDate()
  endTime: Date;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class LessonStatusResponseDto {
  status: LessonStatus;
  buttonStatus: string;
  isClickable: boolean;
  timeConfig: {
    startTime: Date;
    endTime: Date;
    completedTime?: Date;
    lastFeedbackTime?: Date;
    lastAppealTime?: Date;
  };
  feedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  appeal?: {
    reason: string;
    status: string;
    createdAt: Date;
    resolvedAt?: Date;
  };
}
