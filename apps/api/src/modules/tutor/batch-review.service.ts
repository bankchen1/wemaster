import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TutorProfile } from './tutor-profile.entity';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/user.entity';
import { UserRole } from '../user/user-role.enum';

@Injectable()
export class BatchReviewService {
  private readonly logger = new Logger(BatchReviewService.name);

  constructor(
    @InjectRepository(TutorProfile)
    private readonly profileRepository: Repository<TutorProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async batchVerifyProfiles(
    profileIds: string[],
    adminId: string,
    action: 'approve' | 'reject',
    reason?: string,
  ) {
    const profiles = await this.profileRepository.find({
      where: { id: In(profileIds) },
      relations: ['user'],
    });

    const results = await Promise.all(
      profiles.map(async (profile) => {
        try {
          // 更新资料状态
          profile.isVerified = action === 'approve';
          profile.verifiedAt = new Date();
          profile.verifiedBy = adminId;

          // 如果通过审核，更新用户角色
          if (action === 'approve') {
            await this.userRepository.update(
              { id: profile.userId },
              { roles: [UserRole.TUTOR] }
            );
          }

          await this.profileRepository.save(profile);

          // 发送通知
          await this.notificationService.sendToUser(profile.userId, {
            type: 'PROFILE_REVIEW_RESULT',
            title: action === 'approve' ? '资料审核通过' : '资料审核未通过',
            message: action === 'approve'
              ? '恭喜！您的导师资料已通过审核，现在可以开始接单了'
              : `很抱歉，您的导师资料未通过审核。${reason ? `原因：${reason}` : ''}`,
          });

          return {
            profileId: profile.id,
            success: true,
          };
        } catch (error) {
          this.logger.error(
            `Failed to process profile ${profile.id}`,
            error.stack,
          );
          return {
            profileId: profile.id,
            success: false,
            error: error.message,
          };
        }
      }),
    );

    // 统计处理结果
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      total: profiles.length,
      success: successCount,
      failure: failureCount,
      results,
    };
  }

  async batchUpdateStats(
    profileIds: string[],
    stats: {
      rating?: number;
      totalReviews?: number;
      completedSessions?: number;
      bookingCount?: number;
      responseRate?: number;
      responseTime?: number;
    },
  ) {
    const results = await Promise.all(
      profileIds.map(async (profileId) => {
        try {
          await this.profileRepository.update(profileId, stats);
          return {
            profileId,
            success: true,
          };
        } catch (error) {
          this.logger.error(
            `Failed to update stats for profile ${profileId}`,
            error.stack,
          );
          return {
            profileId,
            success: false,
            error: error.message,
          };
        }
      }),
    );

    return {
      total: profileIds.length,
      success: results.filter((r) => r.success).length,
      failure: results.filter((r) => !r.success).length,
      results,
    };
  }

  async getPendingProfiles(options: {
    page?: number;
    limit?: number;
    subjects?: string[];
    search?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      subjects,
      search,
    } = options;

    const query = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('profile.isVerified IS NULL');

    if (subjects?.length) {
      query.andWhere('profile.subjects @> :subjects', { subjects });
    }

    if (search) {
      query.andWhere(
        '(user.name ILIKE :search OR profile.displayName ILIKE :search OR profile.bio ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [profiles, total] = await query
      .orderBy('profile.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      profiles,
      total,
      page,
      limit,
    };
  }
}
