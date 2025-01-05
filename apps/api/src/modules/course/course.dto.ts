import { IsString, IsArray, IsEnum, IsNumber, IsOptional, Min, Max, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateCourseDto {
  @IsString()
  name: string

  @IsEnum(['regular', 'trial', 'group'])
  type: 'regular' | 'trial' | 'group'

  @IsString()
  description: string

  @IsArray()
  @IsString({ each: true })
  syllabus: string[]

  @IsNumber()
  @Min(0)
  price: number

  @IsNumber()
  @Min(15)
  @Max(180)
  duration: number

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
  totalRevenue: number
  completionRate: number
}
