import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
  Headers,
  RawBodyRequest,
  Req,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { PaymentService } from './payment.service'
import { CreatePaymentIntentDto, ProcessRefundDto } from './payment.dto'
import Stripe from 'stripe'

@ApiTags('payment')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '创建支付意向' })
  @ApiResponse({
    status: 201,
    description: '成功创建支付意向',
  })
  async createPaymentIntent(
    @Body(ValidationPipe) createPaymentIntentDto: CreatePaymentIntentDto
  ) {
    return this.paymentService.createPaymentIntent(
      createPaymentIntentDto.scheduleId,
      createPaymentIntentDto.userId
    )
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook 处理' })
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
    @Req() request: RawBodyRequest<any>
  ) {
    const event = this.constructStripeEvent(signature, request.rawBody)
    await this.paymentService.handleStripeWebhook(event)
    return { received: true }
  }

  private constructStripeEvent(signature: string, payload: Buffer): Stripe.Event {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    })
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  }

  @Post(':scheduleId/refund')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'tutor')
  @ApiOperation({ summary: '申请退款' })
  @ApiResponse({
    status: 200,
    description: '成功创建退款申请',
  })
  async processRefund(
    @Param('scheduleId', ParseUUIDPipe) scheduleId: string,
    @Body(ValidationPipe) processRefundDto: ProcessRefundDto
  ) {
    return this.paymentService.processRefund(
      scheduleId,
      processRefundDto.reason
    )
  }

  @Get('stats/:tutorId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('tutor')
  @ApiOperation({ summary: '获取支付统计' })
  @ApiResponse({
    status: 200,
    description: '成功获取支付统计',
  })
  async getPaymentStats(
    @Param('tutorId', ParseUUIDPipe) tutorId: string,
    @Query('period') period: string
  ) {
    return this.paymentService.getPaymentStats(tutorId, period)
  }
}
