import { IsString, IsOptional, IsArray } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsOptional()
  @IsString()
  tutorReply?: string;

  @IsOptional()
  @IsArray()
  helpfulUsers?: string[];
}
