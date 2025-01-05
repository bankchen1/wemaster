import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { TutorProfile } from '../tutor/tutor-profile.entity';
import { Booking } from '../booking/booking.entity';
import { Payment } from '../payment/payment.entity';
import { Review } from '../review/review.entity';

@Injectable()
export class TutorAnalyticsService {
  constructor(
    @InjectRepository(TutorProfile)
    private readonly profileRepository: Repository<TutorProfile>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getTutorDashboardStats(tutorId: string, period: 'week' | 'month' | 'year') {
    const startDate = this.getStartDate(period);
    
    const [
      bookings,
      completedBookings,
      cancelledBookings,
      payments,
      reviews,
      totalStudents,
    ] = await Promise.all([
      // 总预约数
      this.bookingRepository.count({
        where: {
          tutorId,
          createdAt: Between(startDate, new Date()),
        },
      }),
      // 已完成课程数
      this.bookingRepository.count({
        where: {
          tutorId,
          status: 'completed',
          completedAt: Between(startDate, new Date()),
        },
      }),
      // 取消课程数
      this.bookingRepository.count({
        where: {
          tutorId,
          status: 'cancelled',
          cancelledAt: Between(startDate, new Date()),
        },
      }),
      // 收入统计
      this.paymentRepository.find({
        where: {
          tutorId,
          status: 'succeeded',
          createdAt: Between(startDate, new Date()),
        },
      }),
      // 评价统计
      this.reviewRepository.find({
        where: {
          tutorId,
          createdAt: Between(startDate, new Date()),
        },
      }),
      // 学生数量
      this.bookingRepository
        .createQueryBuilder('booking')
        .select('DISTINCT booking.studentId')
        .where('booking.tutorId = :tutorId', { tutorId })
        .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate: new Date(),
        })
        .getCount(),
    ]);

    // 计算收入
    const income = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // 计算平均评分
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // 计算完课率
    const completionRate = bookings
      ? (completedBookings / bookings) * 100
      : 0;

    // 计算取消率
    const cancellationRate = bookings
      ? (cancelledBookings / bookings) * 100
      : 0;

    return {
      period,
      bookings: {
        total: bookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        completionRate,
        cancellationRate,
      },
      income: {
        total: income,
        average: bookings ? income / bookings : 0,
      },
      reviews: {
        total: reviews.length,
        averageRating,
      },
      students: {
        total: totalStudents,
        new: await this.getNewStudentsCount(tutorId, startDate),
        returning: totalStudents - await this.getNewStudentsCount(tutorId, startDate),
      },
      timeDistribution: await this.getTimeDistribution(tutorId, startDate),
      popularSubjects: await this.getPopularSubjects(tutorId, startDate),
    };
  }

  async getTutorPerformanceMetrics(tutorId: string) {
    const [profile, recentBookings] = await Promise.all([
      this.profileRepository.findOne({ where: { id: tutorId } }),
      this.bookingRepository.find({
        where: {
          tutorId,
          createdAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        },
      }),
    ]);

    if (!profile) {
      return null;
    }

    // 计算响应时间（分钟）
    const responseTimes = recentBookings.map(
      (booking) =>
        (booking.firstResponseAt?.getTime() - booking.createdAt.getTime()) /
        (1000 * 60),
    );
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    // 计算响应率
    const responseRate =
      recentBookings.length > 0
        ? (recentBookings.filter((b) => b.firstResponseAt).length /
          recentBookings.length) *
        100
        : 0;

    return {
      rating: profile.rating,
      totalReviews: profile.totalReviews,
      completedSessions: profile.completedSessions,
      responseTime: averageResponseTime,
      responseRate,
      bookingRate:
        recentBookings.length > 0
          ? (recentBookings.filter((b) => b.status === 'completed').length /
            recentBookings.length) *
          100
          : 0,
    };
  }

  private getStartDate(period: 'week' | 'month' | 'year'): Date {
    const date = new Date();
    switch (period) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    return date;
  }

  private async getNewStudentsCount(
    tutorId: string,
    startDate: Date,
  ): Promise<number> {
    return this.bookingRepository
      .createQueryBuilder('booking')
      .select('DISTINCT booking.studentId')
      .where('booking.tutorId = :tutorId', { tutorId })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate: new Date(),
      })
      .andWhere(
        'booking.studentId NOT IN ' +
          this.bookingRepository
            .createQueryBuilder('b')
            .select('DISTINCT b.studentId')
            .where('b.tutorId = :tutorId', { tutorId })
            .andWhere('b.createdAt < :startDate', { startDate })
            .getQuery(),
      )
      .getCount();
  }

  private async getTimeDistribution(
    tutorId: string,
    startDate: Date,
  ): Promise<Array<{ hour: number; count: number }>> {
    const bookings = await this.bookingRepository.find({
      where: {
        tutorId,
        status: 'completed',
        startTime: Between(startDate, new Date()),
      },
      select: ['startTime'],
    });

    const distribution = new Array(24).fill(0);
    bookings.forEach((booking) => {
      const hour = booking.startTime.getHours();
      distribution[hour]++;
    });

    return distribution.map((count, hour) => ({ hour, count }));
  }

  private async getPopularSubjects(
    tutorId: string,
    startDate: Date,
  ): Promise<Array<{ subject: string; count: number }>> {
    const bookings = await this.bookingRepository.find({
      where: {
        tutorId,
        status: 'completed',
        completedAt: Between(startDate, new Date()),
      },
      select: ['subject'],
    });

    const subjects = new Map<string, number>();
    bookings.forEach((booking) => {
      const count = subjects.get(booking.subject) || 0;
      subjects.set(booking.subject, count + 1);
    });

    return Array.from(subjects.entries()).map(([subject, count]) => ({
      subject,
      count,
    }));
  }
}
