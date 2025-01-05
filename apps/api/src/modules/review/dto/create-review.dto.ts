import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  teachingQuality?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communicationSkills?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalism?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  punctuality?: number;
}
