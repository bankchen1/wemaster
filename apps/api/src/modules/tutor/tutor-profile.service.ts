import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorProfile } from './tutor-profile.entity';
import { User } from '../user/user.entity';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { NotificationService } from '../notification/notification.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class TutorProfileService {
  constructor(
    @InjectRepository(TutorProfile)
    private readonly profileRepository: Repository<TutorProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateTutorProfileDto,
  ): Promise<TutorProfile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProfile = await this.profileRepository.findOne({
      where: { userId },
    });
    if (existingProfile) {
      throw new BadRequestException('Tutor profile already exists');
    }

    const profile = this.profileRepository.create({
      userId,
      ...dto,
      isActive: true,
      lastActiveAt: new Date(),
    });

    await this.profileRepository.save(profile);

    // 通知管理员验证新导师资料
    await this.notificationService.sendToAdmins({
      type: 'NEW_TUTOR_PROFILE',
      title: '新导师资料待验证',
      message: `导师 ${dto.displayName} 已完善资料，请及时验证`,
      data: { profileId: profile.id },
    });

    this.logger.info('New tutor profile created', {
      userId,
      profileId: profile.id,
    });

    return profile;
  }

  async updateProfile(
    userId: string,
    dto: UpdateTutorProfileDto,
  ): Promise<TutorProfile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    // 如果更新了关键信息，需要重新验证
    const needsVerification = this.checkIfNeedsVerification(profile, dto);
    if (needsVerification) {
      profile.isVerified = false;
      profile.verifiedAt = null;
      profile.verifiedBy = null;

      // 通知管理员重新验证
      await this.notificationService.sendToAdmins({
        type: 'TUTOR_PROFILE_UPDATED',
        title: '导师资料更新待验证',
        message: `导师 ${dto.displayName} 更新了重要资料，请重新验证`,
        data: { profileId: profile.id },
      });
    }

    Object.assign(profile, dto);
    profile.lastActiveAt = new Date();

    await this.profileRepository.save(profile);

    this.logger.info('Tutor profile updated', {
      userId,
      profileId: profile.id,
      needsVerification,
    });

    return profile;
  }

  async verifyProfile(
    profileId: string,
    adminId: string,
    verified: boolean,
    notes?: string,
  ): Promise<TutorProfile> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    profile.isVerified = verified;
    profile.verifiedAt = new Date();
    profile.verifiedBy = adminId;

    await this.profileRepository.save(profile);

    // 通知导师验证结果
    await this.notificationService.sendToUser(profile.userId, {
      type: 'TUTOR_PROFILE_VERIFIED',
      title: '导师资料验证结果',
      message: verified
        ? '恭喜！您的导师资料已通过验证'
        : `很抱歉，您的导师资料未通过验证${notes ? `。原因：${notes}` : ''}`,
      data: { profileId, verified },
    });

    this.logger.info('Tutor profile verified', {
      profileId,
      adminId,
      verified,
      notes,
    });

    return profile;
  }

  async getProfile(userId: string): Promise<TutorProfile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return profile;
  }

  async getProfileById(profileId: string): Promise<TutorProfile> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return profile;
  }

  async getVerifiedProfiles(options: {
    page?: number;
    limit?: number;
    subjects?: string[];
    languages?: string[];
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    availability?: {
      weekdays?: number[];
      timeRange?: {
        start: string;
        end: string;
      };
    };
  }): Promise<{
    profiles: TutorProfile[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      subjects,
      languages,
      minPrice,
      maxPrice,
      rating,
      availability,
    } = options;

    const query = this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.isVerified = :isVerified', { isVerified: true })
      .andWhere('profile.isActive = :isActive', { isActive: true });

    if (subjects?.length) {
      query.andWhere('profile.subjects @> :subjects', { subjects });
    }

    if (languages?.length) {
      query.andWhere('profile.languages @> :languages', { languages });
    }

    if (minPrice !== undefined) {
      query.andWhere('profile.pricing->>"hourlyRate" >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('profile.pricing->>"hourlyRate" <= :maxPrice', { maxPrice });
    }

    if (rating !== undefined) {
      query.andWhere('profile.rating >= :rating', { rating });
    }

    if (availability?.weekdays?.length) {
      query.andWhere('profile.availability->>"weekdays" @> :weekdays', {
        weekdays: availability.weekdays,
      });
    }

    if (availability?.timeRange) {
      query.andWhere(
        `EXISTS (
          SELECT 1
          FROM jsonb_array_elements(profile.availability->'timeSlots') as slot
          WHERE slot->>'start' <= :timeEnd
          AND slot->>'end' >= :timeStart
        )`,
        {
          timeStart: availability.timeRange.start,
          timeEnd: availability.timeRange.end,
        },
      );
    }

    const [profiles, total] = await query
      .orderBy('profile.rating', 'DESC')
      .addOrderBy('profile.completedSessions', 'DESC')
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

  async updateStats(
    profileId: string,
    stats: {
      rating?: number;
      totalReviews?: number;
      completedSessions?: number;
      bookingCount?: number;
      responseRate?: number;
      responseTime?: number;
    },
  ): Promise<TutorProfile> {
    const profile = await this.getProfileById(profileId);
    Object.assign(profile, stats);
    return this.profileRepository.save(profile);
  }

  private checkIfNeedsVerification(
    oldProfile: TutorProfile,
    newProfile: Partial<TutorProfile>,
  ): boolean {
    // 检查是否修改了需要重新验证的关键信息
    const criticalFields: (keyof TutorProfile)[] = [
      'subjects',
      'levels',
      'languages',
      'pricing',
    ];

    return criticalFields.some((field) => {
      if (!newProfile[field]) return false;
      return JSON.stringify(oldProfile[field]) !== JSON.stringify(newProfile[field]);
    });
  }
}
