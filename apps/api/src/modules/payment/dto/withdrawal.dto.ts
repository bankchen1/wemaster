import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({
    description: '提现金额（分）',
    example: 10000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000)
  amount: number;
}

export class CreateAccountLinkDto {
  @ApiProperty({
    description: '返回 URL',
    example: 'https://example.com/account/settings',
  })
  @IsString()
  @IsNotEmpty()
  returnUrl: string;
}

export class AccountResponse {
  @ApiProperty({
    description: 'Stripe Account ID',
    example: 'acct_123',
  })
  stripeAccountId: string;

  @ApiProperty({
    description: '账户状态',
    example: 'pending_verification',
    enum: ['pending_verification', 'verified', 'rejected'],
  })
  status: string;
}

export class AccountLinkResponse {
  @ApiProperty({
    description: 'Stripe Account Link URL',
    example: 'https://connect.stripe.com/setup/s/xxxxx',
  })
  url: string;
}

export class WithdrawalResponse {
  @ApiProperty({
    description: '提现 ID',
    example: 'withdrawal-123',
  })
  id: string;

  @ApiProperty({
    description: '提现状态',
    example: 'pending',
    enum: ['pending', 'completed', 'failed'],
  })
  status: string;

  @ApiProperty({
    description: '提现金额（分）',
    example: 10000,
  })
  amount: number;
}

export class EarningStatsResponse {
  @ApiProperty({
    description: '总收入（分）',
    example: 100000,
  })
  totalEarnings: number;

  @ApiProperty({
    description: '已提现金额（分）',
    example: 50000,
  })
  totalWithdrawn: number;

  @ApiProperty({
    description: '可提现余额（分）',
    example: 50000,
  })
  balance: number;

  @ApiProperty({
    description: '支付订单数',
    example: 10,
  })
  paymentsCount: number;

  @ApiProperty({
    description: '提现次数',
    example: 5,
  })
  withdrawalsCount: number;
}
