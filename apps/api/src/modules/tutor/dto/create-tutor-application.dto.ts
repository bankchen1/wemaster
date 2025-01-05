import { IsString, IsArray, IsNumber, IsDate, IsOptional, ValidateNested, Min, Max, ArrayMinSize } from 'class-validator'
import { Type } from 'class-transformer'

class EducationDto {
  @IsString()
  degree: string

  @IsString()
  school: string

  @IsString()
  major: string

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  graduationYear: number
}

class CertificateDto {
  @IsString()
  name: string

  @IsString()
  issuer: string

  @IsDate()
  @Type(() => Date)
  date: Date

  @IsString()
  file: string
}

class ExperienceDto {
  @IsString()
  title: string

  @IsString()
  company: string

  @IsDate()
  @Type(() => Date)
  startDate: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date

  @IsString()
  description: string
}

class PricingRegularDto {
  @IsNumber()
  @Min(0)
  price: number

  @IsNumber()
  @Min(30)
  duration: number
}

class PricingGroupDto extends PricingRegularDto {
  @IsNumber()
  @Min(2)
  minStudents: number

  @IsNumber()
  @Min(2)
  maxStudents: number
}

class PricingDto {
  @ValidateNested()
  @Type(() => PricingRegularDto)
  regular: PricingRegularDto

  @ValidateNested()
  @Type(() => PricingRegularDto)
  trial: PricingRegularDto

  @ValidateNested()
  @Type(() => PricingGroupDto)
  group: PricingGroupDto
}

class WorkingHoursDto {
  @IsString()
  start: string

  @IsString()
  end: string
}

class AvailabilityDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  workingDays: number[]

  @ValidateNested()
  @Type(() => WorkingHoursDto)
  workingHours: WorkingHoursDto
}

export class CreateTutorApplicationDto {
  @IsString()
  name: string

  @IsString()
  title: string

  @IsString()
  introduction: string

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages: string[]

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education: EducationDto[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  certificates: CertificateDto[]

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience: ExperienceDto[]

  @ValidateNested()
  @Type(() => PricingDto)
  pricing: PricingDto

  @ValidateNested()
  @Type(() => AvailabilityDto)
  availability: AvailabilityDto

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  subjects: string[]
}
