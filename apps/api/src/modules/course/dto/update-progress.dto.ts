import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  lessonId: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  quizScore?: number;

  @IsOptional()
  @IsArray()
  completedTopics?: string[];
}
