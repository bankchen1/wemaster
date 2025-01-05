import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { CampaignService } from './campaign.service'
import { AnalyticsService } from '../analytics/analytics.service'
import { Logger } from '@nestjs/common'

@Processor('campaign')
export class CampaignProcessor {
  private readonly logger = new Logger(CampaignProcessor.name)

  constructor(
    private readonly campaignService: CampaignService,
    private readonly analyticsService: AnalyticsService
  ) {}

  @Process('recurring')
  async handleRecurringCampaign(job: Job) {
    const { campaignId } = job.data

    try {
      this.logger.log(
        `Starting recurring campaign: ${campaignId}`
      )

      await this.campaignService.executeCampaign(campaignId)

      // 分析执行结果
      const analytics = await this.campaignService.getCampaignAnalytics(
        campaignId
      )

      // 优化下一次执行
      await this.optimizeCampaign(campaignId, analytics)

      this.logger.log(
        `Completed recurring campaign: ${campaignId}`
      )
    } catch (error) {
      this.logger.error(
        `Failed to execute recurring campaign: ${campaignId}`,
        error.stack
      )
      throw error
    }
  }

  @Process('oneTime')
  async handleOneTimeCampaign(job: Job) {
    const { campaignId } = job.data

    try {
      this.logger.log(
        `Starting one-time campaign: ${campaignId}`
      )

      await this.campaignService.executeCampaign(campaignId)

      this.logger.log(
        `Completed one-time campaign: ${campaignId}`
      )
    } catch (error) {
      this.logger.error(
        `Failed to execute one-time campaign: ${campaignId}`,
        error.stack
      )
      throw error
    }
  }

  @Process('abTest')
  async handleABTest(job: Job) {
    const { campaignId, variantId } = job.data

    try {
      this.logger.log(
        `Starting A/B test for campaign: ${campaignId}, variant: ${variantId}`
      )

      // 执行A/B测试变体
      await this.campaignService.executeCampaign(campaignId)

      // 收集和分析测试数据
      const testResults = await this.analyticsService.getABTestResults(
        campaignId,
        variantId
      )

      // 确定获胜变体
      if (testResults.hasWinner) {
        await this.handleTestWinner(
          campaignId,
          testResults.winnerId
        )
      }

      this.logger.log(
        `Completed A/B test for campaign: ${campaignId}`
      )
    } catch (error) {
      this.logger.error(
        `Failed to execute A/B test: ${campaignId}`,
        error.stack
      )
      throw error
    }
  }

  private async optimizeCampaign(
    campaignId: string,
    analytics: any
  ) {
    try {
      // 基于分析结果优化活动
      const recommendations = await this.analyticsService.getOptimizationRecommendations(
        analytics
      )

      // 应用优化建议
      if (recommendations.timing) {
        await this.updateCampaignTiming(
          campaignId,
          recommendations.timing
        )
      }

      if (recommendations.targeting) {
        await this.updateCampaignTargeting(
          campaignId,
          recommendations.targeting
        )
      }

      if (recommendations.content) {
        await this.updateCampaignContent(
          campaignId,
          recommendations.content
        )
      }

      this.logger.log(
        `Optimized campaign: ${campaignId}`
      )
    } catch (error) {
      this.logger.error(
        `Failed to optimize campaign: ${campaignId}`,
        error.stack
      )
    }
  }

  private async handleTestWinner(
    campaignId: string,
    winnerId: string
  ) {
    try {
      // 更新活动以使用获胜变体
      await this.campaignService.updateCampaign(campaignId, {
        template: { id: winnerId },
        abTest: { enabled: false }
      })

      // 记录测试结果
      await this.analyticsService.recordABTestResults(
        campaignId,
        winnerId
      )

      this.logger.log(
        `Updated campaign ${campaignId} with winning variant ${winnerId}`
      )
    } catch (error) {
      this.logger.error(
        `Failed to handle test winner: ${campaignId}`,
        error.stack
      )
    }
  }

  private async updateCampaignTiming(
    campaignId: string,
    timing: any
  ) {
    // 更新活动执行时间
    await this.campaignService.updateCampaign(campaignId, {
      schedule: timing
    })
  }

  private async updateCampaignTargeting(
    campaignId: string,
    targeting: any
  ) {
    // 更新目标受众
    await this.campaignService.updateCampaign(campaignId, {
      targetAudience: targeting
    })
  }

  private async updateCampaignContent(
    campaignId: string,
    content: any
  ) {
    // 更新活动内容
    await this.campaignService.updateCampaign(campaignId, {
      template: content
    })
  }

  @Process('cleanup')
  async handleCleanup(job: Job) {
    try {
      this.logger.log('Starting campaign cleanup')

      // 清理过期的活动数据
      const expiryDays = 30 // 配置清理时间
      const expiredDate = new Date()
      expiredDate.setDate(
        expiredDate.getDate() - expiryDays
      )

      // 清理消息历史
      await this.campaignService.cleanupMessageHistory(
        expiredDate
      )

      // 清理分析数据
      await this.analyticsService.cleanupAnalyticsData(
        expiredDate
      )

      // 清理临时文件
      await this.campaignService.cleanupTempFiles()

      this.logger.log('Completed campaign cleanup')
    } catch (error) {
      this.logger.error(
        'Failed to cleanup campaigns',
        error.stack
      )
      throw error
    }
  }
}
