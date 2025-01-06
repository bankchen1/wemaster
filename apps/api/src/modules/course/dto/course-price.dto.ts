import { IsNumber, IsEnum, IsOptional, Min, IsPositive } from 'class-validator';
import { CourseType } from '@wemaster/shared/types/pricing';

export class CalculatePriceDto {
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @IsEnum(CourseType)
  courseType: CourseType;

  @IsNumber()
  @IsOptional()
  @Min(1)
  lessonsCount?: number;
}

export class UpdatePriceDto {
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  lessonsCount?: number;
}
