import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingProgress } from './onboarding.entity';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingProgress)
    private onboardingRepo: Repository<OnboardingProgress>,
  ) {}

  async getProgress(userId: string): Promise<OnboardingProgress> {
    const progress = await this.onboardingRepo.findOne({
      where: { userId },
    });

    if (!progress) {
      return this.onboardingRepo.save({
        userId,
        completedSteps: {},
        isCompleted: false,
      });
    }

    return progress;
  }

  async updateProgress(
    userId: string,
    stepId: string,
    data: any,
  ): Promise<OnboardingProgress> {
    let progress = await this.getProgress(userId);

    progress.completedSteps = {
      ...progress.completedSteps,
      [stepId]: true,
    };

    if (data) {
      progress.preferences = {
        ...progress.preferences,
        [stepId]: data,
      };
    }

    // 检查是否所有步骤都完成了
    const allStepsCompleted = [
      'profile',
      'preferences',
      'schedule',
    ].every((step) => progress.completedSteps[step]);

    if (allStepsCompleted) {
      progress.isCompleted = true;
    }

    return this.onboardingRepo.save(progress);
  }

  async completeOnboarding(userId: string): Promise<OnboardingProgress> {
    const progress = await this.getProgress(userId);
    progress.isCompleted = true;
    return this.onboardingRepo.save(progress);
  }

  async resetProgress(userId: string): Promise<OnboardingProgress> {
    const progress = await this.getProgress(userId);
    progress.completedSteps = {};
    progress.isCompleted = false;
    progress.preferences = null;
    return this.onboardingRepo.save(progress);
  }
}
