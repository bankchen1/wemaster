import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { startOfMonth, endOfMonth } from 'date-fns';
import {
  CourseType,
  CoursePrice,
  MonthlyBonus,
  RefundCalculation,
} from '@wemaster/shared/types/pricing';
import { BookingEntity } from '../booking/booking.entity';

@Injectable()
export class PricingService {
  private readonly PLATFORM_FEE_RATE = 0.25; // 平台服务费率 25%
  private readonly BONUS_TIERS = [
    { min: 50, rate: 0.07 },
    { min: 30, rate: 0.05 },
    { min: 10, rate: 0.03 },
    { min: 0, rate: 0 },
  ];

  constructor(
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
  ) {}

  /**
   * 计算课程价格
   * @param tutorBasePrice 导师期望收入
   * @returns 课程价格详情
   */
  calculateCoursePrice(tutorBasePrice: number): CoursePrice {
    // 导师期望收入为总价的75%
    const totalPrice = tutorBasePrice / (1 - this.PLATFORM_FEE_RATE);
    const platformFee = totalPrice * this.PLATFORM_FEE_RATE;

    return {
      basePrice: tutorBasePrice,
      platformFee,
      totalPrice,
      taxIncluded: true,
    };
  }

  /**
   * 计算课时包单价
   * @param totalPrice 课时包总价
   * @param lessonsCount 课时数
   * @returns 单课时价格
   */
  calculateLessonsPlanPrice(totalPrice: number, lessonsCount: number): number {
    return totalPrice / lessonsCount;
  }

  /**
   * 计算月度奖金
   * @param tutorId 导师ID
   * @param month 月份
   * @returns 奖金计算结果
   */
  async calculateMonthlyBonus(
    tutorId: string,
    month: Date = new Date(),
  ): Promise<MonthlyBonus> {
    // 获取指定月份的课时数
    const completedLessons = await this.bookingRepository.count({
      where: {
        tutorId,
        status: 'completed',
        updatedAt: Between(startOfMonth(month), endOfMonth(month)),
      },
    });

    // 获取基础收入
    const bookings = await this.bookingRepository.find({
      where: {
        tutorId,
        status: 'completed',
        updatedAt: Between(startOfMonth(month), endOfMonth(month)),
      },
    });

    const baseIncome = bookings.reduce((sum, booking) => sum + booking.amount, 0);

    // 计算奖金比例
    const bonusTier = this.BONUS_TIERS.find(
      (tier) => completedLessons >= tier.min,
    );
    const bonusRate = bonusTier?.rate || 0;
    const bonusAmount = baseIncome * bonusRate;

    return {
      lessonCount: completedLessons,
      bonusRate,
      bonusAmount,
      baseIncome,
      totalIncome: baseIncome + bonusAmount,
    };
  }

  /**
   * 计算退款金额
   * @param params 退款计算参数
   * @returns 退款金额
   */
  calculateRefundAmount(params: {
    totalPrice: number;
    giftCardAmount: number;
    couponAmount: number;
    completedLessons: number;
    tutorBasePrice: number;
  }): RefundCalculation {
    const {
      totalPrice,
      giftCardAmount,
      couponAmount,
      completedLessons,
      tutorBasePrice,
    } = params;

    const refundAmount =
      totalPrice -
      giftCardAmount -
      couponAmount -
      completedLessons * tutorBasePrice;

    return {
      totalPrice,
      giftCardAmount,
      couponAmount,
      completedLessons,
      tutorBasePrice,
      refundAmount: Math.max(0, refundAmount), // 确保退款金额不为负
    };
  }

  /**
   * 计算导师实际收入
   * @param courseType 课程类型
   * @param params 计算参数
   * @returns 导师实际收入
   */
  async calculateTutorIncome(
    courseType: CourseType,
    params: {
      totalPrice: number;
      lessonsCount?: number;
      completedLessons?: number;
      month?: Date;
      tutorId?: string;
    },
  ): Promise<number> {
    const { totalPrice, lessonsCount, completedLessons = 0, month, tutorId } = params;
    let baseIncome = 0;

    // 计算基础收入
    switch (courseType) {
      case CourseType.LESSONS_PLAN:
        if (!lessonsCount) throw new Error('Lessons count required for lessons plan');
        const lessonPrice = this.calculateLessonsPlanPrice(totalPrice, lessonsCount);
        baseIncome = completedLessons * lessonPrice * (1 - this.PLATFORM_FEE_RATE);
        break;

      case CourseType.ONE_ON_ONE:
        baseIncome = totalPrice * (1 - this.PLATFORM_FEE_RATE);
        break;

      case CourseType.TRIAL_LESSON:
        baseIncome = totalPrice * (1 - this.PLATFORM_FEE_RATE);
        break;
    }

    // 计算月度奖金
    if (tutorId && month) {
      const { bonusAmount } = await this.calculateMonthlyBonus(tutorId, month);
      baseIncome += bonusAmount;
    }

    return baseIncome;
  }
}
