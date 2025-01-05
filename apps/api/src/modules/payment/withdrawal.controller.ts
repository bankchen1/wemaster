import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
  Request,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { WithdrawalService } from './withdrawal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateWithdrawalDto,
  CreateAccountLinkDto,
  AccountResponse,
  AccountLinkResponse,
  WithdrawalResponse,
  EarningStatsResponse,
} from './dto/withdrawal.dto';

@ApiTags('withdrawal')
@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post('accounts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tutor')
  @ApiOperation({ summary: '创建 Stripe 账户' })
  @ApiResponse({
    status: 201,
    description: '成功创建 Stripe 账户',
    type: AccountResponse,
  })
  async createAccount(@Request() req) {
    return this.withdrawalService.createStripeAccount(req.user);
  }

  @Post('accounts/links')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tutor')
  @ApiOperation({ summary: '生成账户链接' })
  @ApiResponse({
    status: 200,
    description: '成功生成账户链接',
    type: AccountLinkResponse,
  })
  async createAccountLink(
    @Body() createAccountLinkDto: CreateAccountLinkDto,
    @Request() req,
  ) {
    return this.withdrawalService.createAccountLink(
      req.user.id,
      createAccountLinkDto.returnUrl,
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tutor')
  @ApiOperation({ summary: '申请提现' })
  @ApiResponse({
    status: 201,
    description: '成功创建提现申请',
    type: WithdrawalResponse,
  })
  async createWithdrawal(
    @Body() createWithdrawalDto: CreateWithdrawalDto,
    @Request() req,
  ) {
    return this.withdrawalService.createWithdrawal(
      req.user.id,
      createWithdrawalDto.amount,
    );
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tutor')
  @ApiOperation({ summary: '获取收入统计' })
  @ApiResponse({
    status: 200,
    description: '成功获取收入统计',
    type: EarningStatsResponse,
  })
  async getStats(@Request() req) {
    return this.withdrawalService.getEarningStats(req.user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Connect Webhook 处理' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe Webhook 签名',
  })
  @ApiResponse({
    status: 200,
    description: '成功处理 Webhook 事件',
    schema: {
      properties: {
        received: { type: 'boolean', example: true },
      },
    },
  })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.withdrawalService.handleStripeWebhook(request.rawBody, signature);
  }
}
