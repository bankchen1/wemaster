import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({
    description: '课程预约 ID',
    example: 'booking-123',
  })
  @IsString()
  @IsNotEmpty()
  bookingId: string;
}

export class CreateRefundDto {
  @ApiProperty({
    description: '课程预约 ID',
    example: 'booking-123',
  })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: '退款原因',
    example: '学生申请退款',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class PaymentIntentResponse {
  @ApiProperty({
    description: 'Stripe Client Secret',
    example: 'pi_123_secret_456',
  })
  clientSecret: string;
}

export class RefundResponse {
  @ApiProperty({
    description: '退款 ID',
    example: 'refund-123',
  })
  id: string;

  @ApiProperty({
    description: '退款状态',
    example: 'pending',
    enum: ['pending', 'completed', 'failed'],
  })
  status: string;

  @ApiProperty({
    description: '退款金额（分）',
    example: 10000,
  })
  amount: number;
}
