import { IsString, IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsDateString, Min, Max, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateTutorDto {
  @IsString()
  userId: string

  @IsString()
  name: string

  @IsString()
  title: string

  @IsString()
  introduction: string

  @IsArray()
  @IsString({ each: true })
  languages: string[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education: EducationDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  certificates: CertificateDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience: ExperienceDto[]

  @IsObject()
  @ValidateNested()
  @Type(() => PricingDto)
  pricing: PricingDto

  @IsArray()
  @IsString({ each: true })
  specialties: string[]

  @IsString()
  timeZone: string

  @IsObject()
  @ValidateNested()
  @Type(() => AvailabilityDto)
  availability: AvailabilityDto
}

export class UpdateTutorDto extends CreateTutorDto {
  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive'
}

export class EducationDto {
  @IsString()
  degree: string

  @IsString()
  school: string

  @IsString()
  major: string

  @IsNumber()
  @Min(1900)
  @Max(2100)
  graduationYear: number
}

export class CertificateDto {
  @IsString()
  name: string

  @IsString()
  issuer: string

  @IsDateString()
  date: Date

  @IsString()
  file: string
}

export class ExperienceDto {
  @IsString()
  title: string

  @IsString()
  company: string

  @IsDateString()
  startDate: Date

  @IsDateString()
  endDate: Date

  @IsString()
  description: string
}

export class PricingDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CourseTypeDto)
  regular: CourseTypeDto

  @IsObject()
  @ValidateNested()
  @Type(() => CourseTypeDto)
  trial: CourseTypeDto

  @IsObject()
  @ValidateNested()
  @Type(() => GroupCourseTypeDto)
  group: GroupCourseTypeDto
}

export class CourseTypeDto {
  @IsNumber()
  @Min(0)
  price: number

  @IsNumber()
  @Min(15)
  @Max(180)
  duration: number
}

export class GroupCourseTypeDto extends CourseTypeDto {
  @IsNumber()
  @Min(2)
  minStudents: number

  @IsNumber()
  @Min(2)
  maxStudents: number
}

export class AvailabilityDto {
  @IsArray()
  @IsNumber({}, { each: true })
  workingDays: number[]

  @IsObject()
  workingHours: {
    start: string
    end: string
  }
}

export class TutorSearchParams {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number

  @IsOptional()
  @IsObject()
  availability?: {
    days: number[]
  }

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number
}

export class UploadGalleryDto {
  @IsArray()
  files: Express.Multer.File[]
}

export class EarningsQueryDto {
  @IsEnum(['week', 'month', 'year'])
  period: 'week' | 'month' | 'year'
}

export class ReviewQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number
}
