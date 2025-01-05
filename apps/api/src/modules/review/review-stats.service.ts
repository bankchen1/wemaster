import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewStats } from './review-stats.entity';
import { Review } from './review.entity';

@Injectable()
export class ReviewStatsService {
  constructor(
    @InjectRepository(ReviewStats)
    private readonly statsRepository: Repository<ReviewStats>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async updateTutorStats(tutorId: string): Promise<ReviewStats> {
    const reviews = await this.reviewRepository.find({
      where: { tutorId },
    });

    const stats = await this.calculateStats(reviews);
    let reviewStats = await this.statsRepository.findOne({
      where: { tutorId },
    });

    if (!reviewStats) {
      reviewStats = this.statsRepository.create({ tutorId });
    }

    Object.assign(reviewStats, stats);
    return this.statsRepository.save(reviewStats);
  }

  async updateCourseStats(courseId: string): Promise<ReviewStats> {
    const reviews = await this.reviewRepository.find({
      where: { courseId },
    });

    const stats = await this.calculateStats(reviews);
    let reviewStats = await this.statsRepository.findOne({
      where: { courseId },
    });

    if (!reviewStats) {
      reviewStats = this.statsRepository.create({ courseId });
    }

    Object.assign(reviewStats, stats);
    return this.statsRepository.save(reviewStats);
  }

  private async calculateStats(reviews: Review[]): Promise<Partial<ReviewStats>> {
    if (!reviews.length) {
      return {
        averageRating: 0,
        teachingQuality: 0,
        communicationSkills: 0,
        professionalism: 0,
        punctuality: 0,
        totalReviews: 0,
        ratingDistribution: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        },
        commonTags: [],
      };
    }

    // Calculate average ratings
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const totalTeachingQuality = reviews.reduce(
      (sum, review) => sum + (review as any).teachingQuality || 0,
      0,
    );
    const totalCommunicationSkills = reviews.reduce(
      (sum, review) => sum + (review as any).communicationSkills || 0,
      0,
    );
    const totalProfessionalism = reviews.reduce(
      (sum, review) => sum + (review as any).professionalism || 0,
      0,
    );
    const totalPunctuality = reviews.reduce(
      (sum, review) => sum + (review as any).punctuality || 0,
      0,
    );

    // Calculate rating distribution
    const ratingDistribution = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };
    reviews.forEach(review => {
      ratingDistribution[Math.round(review.rating).toString()]++;
    });

    // Calculate common tags
    const tagCount = new Map<string, number>();
    reviews.forEach(review => {
      if (review.tags) {
        review.tags.forEach(tag => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        });
      }
    });

    const commonTags = Array.from(tagCount.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      averageRating: totalRating / reviews.length,
      teachingQuality: totalTeachingQuality / reviews.length,
      communicationSkills: totalCommunicationSkills / reviews.length,
      professionalism: totalProfessionalism / reviews.length,
      punctuality: totalPunctuality / reviews.length,
      totalReviews: reviews.length,
      ratingDistribution,
      commonTags,
    };
  }

  async getTutorStats(tutorId: string): Promise<ReviewStats> {
    const stats = await this.statsRepository.findOne({
      where: { tutorId },
    });

    if (!stats) {
      return this.updateTutorStats(tutorId);
    }

    return stats;
  }

  async getCourseStats(courseId: string): Promise<ReviewStats> {
    const stats = await this.statsRepository.findOne({
      where: { courseId },
    });

    if (!stats) {
      return this.updateCourseStats(courseId);
    }

    return stats;
  }

  async getTopTutors(limit: number = 10): Promise<ReviewStats[]> {
    return this.statsRepository.find({
      where: { tutorId: { not: null } },
      order: { averageRating: 'DESC' },
      take: limit,
      relations: ['tutor'],
    });
  }

  async getTopCourses(limit: number = 10): Promise<ReviewStats[]> {
    return this.statsRepository.find({
      where: { courseId: { not: null } },
      order: { averageRating: 'DESC' },
      take: limit,
      relations: ['course'],
    });
  }
}
