import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WalletTransaction, TransactionType, TransactionStatus, FundsStatus } from '@wemaster/shared/types/wallet';
import { WalletEntity } from './wallet.entity';
import { TransactionEntity } from './transaction.entity';
import { BookingStatus } from '@wemaster/shared/types/booking';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    private dataSource: DataSource,
  ) {}

  async createTransaction(data: Partial<WalletTransaction>) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 创建交易记录
      const transaction = await queryRunner.manager.save(TransactionEntity, {
        ...data,
        status: TransactionStatus.PROCESSING,
      });

      // 更新钱包余额
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { userId: data.userId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // 根据交易类型和资金状态更新余额
      switch (data.type) {
        case TransactionType.COURSE_PAYMENT:
          wallet.availableBalance -= data.amount;
          break;
        case TransactionType.COURSE_EARNING:
          if (data.fundsStatus === FundsStatus.FROZEN) {
            wallet.frozenBalance += data.amount;
          } else if (data.fundsStatus === FundsStatus.AVAILABLE) {
            wallet.availableBalance += data.amount;
          }
          break;
        case TransactionType.COURSE_REFUND:
          wallet.availableBalance += data.amount;
          break;
        case TransactionType.APPEAL_REFUND:
          wallet.lockedBalance -= data.amount;
          wallet.availableBalance += data.amount;
          break;
      }

      wallet.totalBalance = 
        wallet.availableBalance + wallet.frozenBalance + wallet.lockedBalance;
      
      await queryRunner.manager.save(WalletEntity, wallet);
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleBookingPayment(bookingId: string, amount: number, studentId: string, tutorId: string) {
    // 创建学生支付交易
    await this.createTransaction({
      userId: studentId,
      type: TransactionType.COURSE_PAYMENT,
      amount,
      fundsStatus: FundsStatus.AVAILABLE,
      relatedId: bookingId,
      description: '课程支付',
    });

    // 创建导师收入交易（冻结状态）
    await this.createTransaction({
      userId: tutorId,
      type: TransactionType.COURSE_EARNING,
      amount,
      fundsStatus: FundsStatus.FROZEN,
      relatedId: bookingId,
      description: '课程收入（待结算）',
    });
  }

  async handleBookingCompletion(bookingId: string, tutorId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        relatedId: bookingId,
        userId: tutorId,
        type: TransactionType.COURSE_EARNING,
        fundsStatus: FundsStatus.FROZEN,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // 创建新的可用资金交易
    await this.createTransaction({
      userId: tutorId,
      type: TransactionType.COURSE_EARNING,
      amount: transaction.amount,
      fundsStatus: FundsStatus.AVAILABLE,
      relatedId: bookingId,
      description: '课程收入（已结算）',
    });

    // 更新原交易状态
    transaction.status = TransactionStatus.COMPLETED;
    await this.transactionRepository.save(transaction);
  }

  async handleBookingRefund(bookingId: string, amount: number, studentId: string, tutorId: string) {
    // 退款给学生
    await this.createTransaction({
      userId: studentId,
      type: TransactionType.COURSE_REFUND,
      amount,
      fundsStatus: FundsStatus.AVAILABLE,
      relatedId: bookingId,
      description: '课程退款',
    });

    // 从导师的冻结资金中扣除
    const tutorTransaction = await this.transactionRepository.findOne({
      where: {
        relatedId: bookingId,
        userId: tutorId,
        type: TransactionType.COURSE_EARNING,
        fundsStatus: FundsStatus.FROZEN,
      },
    });

    if (tutorTransaction) {
      tutorTransaction.status = TransactionStatus.CANCELLED;
      await this.transactionRepository.save(tutorTransaction);
    }
  }

  async handleAppealStart(bookingId: string, tutorId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        relatedId: bookingId,
        userId: tutorId,
        type: TransactionType.COURSE_EARNING,
        fundsStatus: FundsStatus.FROZEN,
      },
    });

    if (transaction) {
      transaction.fundsStatus = FundsStatus.LOCKED;
      await this.transactionRepository.save(transaction);
    }
  }

  async getWalletBalance(userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      return {
        userId,
        availableBalance: 0,
        frozenBalance: 0,
        lockedBalance: 0,
        totalBalance: 0,
        updatedAt: new Date(),
      };
    }

    return wallet;
  }

  async getTransactions(userId: string, options?: {
    type?: TransactionType;
    status?: TransactionStatus;
    fundsStatus?: FundsStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const query = this.transactionRepository.createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (options?.type) {
      query.andWhere('transaction.type = :type', { type: options.type });
    }

    if (options?.status) {
      query.andWhere('transaction.status = :status', { status: options.status });
    }

    if (options?.fundsStatus) {
      query.andWhere('transaction.fundsStatus = :fundsStatus', { fundsStatus: options.fundsStatus });
    }

    if (options?.startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate: options.startDate });
    }

    if (options?.endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate: options.endDate });
    }

    query.orderBy('transaction.createdAt', 'DESC');

    if (options?.page && options?.limit) {
      query.skip((options.page - 1) * options.limit)
        .take(options.limit);
    }

    return query.getManyAndCount();
  }
}
