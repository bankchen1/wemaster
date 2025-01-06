import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking, BookingStatus } from '@wemaster/shared/types/booking';
import { BookingEntity } from './booking.entity';
import { WalletService } from '../wallet/wallet.service';
import { ScheduleService } from '../schedule/schedule.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    private walletService: WalletService,
    private scheduleService: ScheduleService,
    private notificationService: NotificationService,
    private dataSource: DataSource,
  ) {}

  async createBooking(data: Partial<Booking>) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 检查时间段是否可用
      const timeSlot = await this.scheduleService.checkTimeSlotAvailability(
        data.timeSlotId,
      );

      if (!timeSlot) {
        throw new Error('Time slot not available');
      }

      // 2. 创建预约记录
      const booking = await queryRunner.manager.save(BookingEntity, {
        ...data,
        status: BookingStatus.PENDING,
      });

      // 3. 锁定时间段
      await this.scheduleService.lockTimeSlot(data.timeSlotId);

      // 4. 处理支付
      await this.walletService.handleBookingPayment(
        booking.id,
        booking.amount,
        booking.studentId,
        booking.tutorId,
      );

      // 5. 发送通知
      await this.notificationService.sendBookingNotification(booking);

      await queryRunner.commitTransaction();
      return booking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async completeBooking(bookingId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // 更新预约状态
    booking.status = BookingStatus.COMPLETED;
    await this.bookingRepository.save(booking);

    // 24小时后自动结算给导师
    setTimeout(async () => {
      const updatedBooking = await this.bookingRepository.findOne({
        where: { id: bookingId },
      });

      // 如果24小时内没有申诉，则结算给导师
      if (
        updatedBooking.status === BookingStatus.COMPLETED &&
        !updatedBooking.appealId
      ) {
        await this.walletService.handleBookingCompletion(
          bookingId,
          booking.tutorId,
        );
      }
    }, 24 * 60 * 60 * 1000); // 24小时
  }

  async cancelBooking(bookingId: string, reason: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // 检查是否可以取消（24小时前）
    const now = new Date();
    const bookingTime = new Date(booking.timeSlot.startTime);
    const hoursDiff = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      throw new Error('Cannot cancel booking within 24 hours');
    }

    // 更新预约状态
    booking.status = BookingStatus.CANCELLED;
    booking.cancelReason = reason;
    await this.bookingRepository.save(booking);

    // 处理退款
    await this.walletService.handleBookingRefund(
      bookingId,
      booking.amount,
      booking.studentId,
      booking.tutorId,
    );

    // 释放时间段
    await this.scheduleService.unlockTimeSlot(booking.timeSlotId);

    // 发送通知
    await this.notificationService.sendBookingCancellationNotification(booking);
  }

  async handleAppealStart(bookingId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // 锁定导师资金
    await this.walletService.handleAppealStart(bookingId, booking.tutorId);
  }

  async getBooking(bookingId: string) {
    return this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['timeSlot', 'course', 'student', 'tutor'],
    });
  }

  async getBookings(userId: string, role: 'student' | 'tutor', options?: {
    status?: BookingStatus[];
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.timeSlot', 'timeSlot')
      .leftJoinAndSelect('booking.course', 'course')
      .leftJoinAndSelect('booking.student', 'student')
      .leftJoinAndSelect('booking.tutor', 'tutor');

    if (role === 'student') {
      query.where('booking.studentId = :userId', { userId });
    } else {
      query.where('booking.tutorId = :userId', { userId });
    }

    if (options?.status) {
      query.andWhere('booking.status IN (:...status)', { status: options.status });
    }

    if (options?.startDate) {
      query.andWhere('timeSlot.startTime >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('timeSlot.startTime <= :endDate', { endDate: options.endDate });
    }

    query.orderBy('timeSlot.startTime', 'DESC');

    if (options?.page && options?.limit) {
      query.skip((options.page - 1) * options.limit)
        .take(options.limit);
    }

    return query.getManyAndCount();
  }
}
