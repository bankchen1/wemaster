import { IsString, IsArray, IsEnum, IsNumber, IsOptional, Min, Max, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CourseType } from '@wemaster/shared/types/pricing'

export class CreateCourseDto {
  @IsString()
  name: string

  @IsEnum(CourseType)
  courseType: CourseType

  @IsString()
  description: string

  @IsArray()
  @IsString({ each: true })
  syllabus: string[]

  @IsNumber()
  @Min(0)
  basePrice: number

  @IsNumber()
  @Min(15)
  @Max(180)
  duration: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  lessonsCount?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  minStudents?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxStudents?: number

  @IsOptional()
  @ValidateNested()
  @Type(() => GroupScheduleDto)
  groupSchedule?: GroupScheduleDto
}

export class UpdateCourseDto extends CreateCourseDto {
  @IsOptional()
  @IsEnum(['active', 'draft', 'archived'])
  status?: 'active' | 'draft' | 'archived'
}

export class GroupScheduleDto {
  @IsString()
  startDate: string

  @IsString()
  endDate: string

  @IsArray()
  @IsNumber({}, { each: true })
  weekdays: number[]

  @IsString()
  time: string
}

export class MaterialDto {
  @IsString()
  name: string

  @IsString()
  type: string

  @IsString()
  url: string

  @IsNumber()
  size: number
}

export class CourseScheduleQueryDto {
  @IsString()
  startDate: string

  @IsString()
  endDate: string
}

export class CourseStatsDto {
  totalStudents: number
  totalSessions: number
  averageRating: number
  reviewCount: number
  completedLessons: number
  totalRevenue: number
  completionRate: number
}

export class CoursePriceInfoDto {
  basePrice: number
  platformFee: number
  displayPrice: number
  perLessonPrice?: number
}
