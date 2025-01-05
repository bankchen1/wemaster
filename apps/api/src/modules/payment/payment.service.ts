import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { Payment } from './payment.entity'
import { Schedule } from '../schedule/schedule.entity'
import { User } from '../user/user.entity'
import { NotificationService } from '../notification/notification.service'

@Injectable()
export class PaymentService {
  private stripe: Stripe

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private configService: ConfigService,
    private notificationService: NotificationService
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16'
    })
  }

  async createPaymentIntent(
    scheduleId: string,
    userId: string
  ): Promise<{ clientSecret: string }> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['course', 'tutor']
    })

    if (!schedule) {
      throw new BadRequestException('课程预约不存在')
    }

    // 计算实际支付金额（考虑优惠券等）
    const amount = await this.calculateAmount(schedule)

    // 创建支付意向
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'cny',
      metadata: {
        scheduleId,
        userId,
        tutorId: schedule.tutor.id,
        courseId: schedule.course.id
      }
    })

    // 创建支付记录
    await this.paymentRepository.save({
      userId,
      scheduleId,
      amount,
      paymentIntentId: paymentIntent.id,
      status: 'pending'
    })

    return { clientSecret: paymentIntent.client_secret }
  }

  private async calculateAmount(schedule: Schedule): Promise<number> {
    // TODO: 实现优惠券和折扣逻辑
    return schedule.course.price * 100 // Stripe使用最小货币单位（分）
  }

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
        break
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentIntentId: paymentIntent.id }
    })

    if (!payment) return

    // 更新支付状态
    payment.status = 'completed'
    payment.completedAt = new Date()
    await this.paymentRepository.save(payment)

    // 更新课程预约状态
    const schedule = await this.scheduleRepository.findOne({
      where: { id: payment.scheduleId },
      relations: ['tutor', 'student']
    })
    schedule.status = 'confirmed'
    await this.scheduleRepository.save(schedule)

    // 发送通知
    await this.notificationService.sendPaymentSuccessNotification(schedule)
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentIntentId: paymentIntent.id }
    })

    if (!payment) return

    // 更新支付状态
    payment.status = 'failed'
    payment.error = paymentIntent.last_payment_error?.message
    await this.paymentRepository.save(payment)

    // 更新课程预约状态
    const schedule = await this.scheduleRepository.findOne({
      where: { id: payment.scheduleId },
      relations: ['tutor', 'student']
    })
    schedule.status = 'cancelled'
    await this.scheduleRepository.save(schedule)

    // 发送通知
    await this.notificationService.sendPaymentFailureNotification(schedule)
  }

  async processRefund(
    scheduleId: string,
    reason: string
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { scheduleId }
    })

    if (!payment || payment.status !== 'completed') {
      throw new BadRequestException('找不到相关支付记录或支付未完成')
    }

    // 计算退款金额
    const refundAmount = await this.calculateRefundAmount(payment)

    // 创建退款
    const refund = await this.stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
      amount: refundAmount,
      metadata: {
        reason,
        scheduleId
      }
    })

    // 更新支付记录
    payment.refundId = refund.id
    payment.refundAmount = refundAmount
    payment.refundReason = reason
    payment.status = 'refunded'
    await this.paymentRepository.save(payment)

    // 更新课程预约状态
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['tutor', 'student']
    })
    schedule.status = 'cancelled'
    await this.scheduleRepository.save(schedule)

    // 发送通知
    await this.notificationService.sendRefundNotification(schedule, refundAmount)
  }

  private async calculateRefundAmount(payment: Payment): Promise<number> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: payment.scheduleId }
    })

    // 根据取消时间计算退款金额
    const now = new Date()
    const startTime = schedule.startTime
    const hoursDifference = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    // 24小时以上全额退款
    if (hoursDifference >= 24) {
      return payment.amount
    }

    // 12-24小时退款80%
    if (hoursDifference >= 12) {
      return Math.floor(payment.amount * 0.8)
    }

    // 6-12小时退款50%
    if (hoursDifference >= 6) {
      return Math.floor(payment.amount * 0.5)
    }

    // 6小时以内不退款
    return 0
  }

  async getPaymentStats(tutorId: string, period: string): Promise<any> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.schedule', 'schedule')
      .where('schedule.tutorId = :tutorId', { tutorId })
      .andWhere('payment.status = :status', { status: 'completed' })

    // 设置时间范围
    const now = new Date()
    let startDate: Date
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1))
    }

    queryBuilder.andWhere('payment.completedAt >= :startDate', { startDate })

    const payments = await queryBuilder.getMany()

    return {
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      totalCount: payments.length,
      averageAmount: payments.length > 0
        ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
        : 0,
      refundAmount: payments
        .filter(p => p.refundAmount)
        .reduce((sum, p) => sum + p.refundAmount, 0)
    }
  }
}
