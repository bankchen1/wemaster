import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BullQueue } from '@nestjs/bull'
import { InjectQueue } from '@nestjs/bull'
import { Campaign } from './campaign.entity'
import { User } from '../user/user.entity'
import { MessageService } from '../message/message.service'
import { NotificationService } from '../notification/notification.service'
import { AnalyticsService } from '../analytics/analytics.service'

interface CampaignTemplate {
  id: string
  name: string
  content: string
  type: 'email' | 'push' | 'in-app'
  metadata?: any
  variables?: string[]
}

interface CampaignRule {
  id: string
  name: string
  conditions: {
    field: string
    operator: string
    value: any
  }[]
  actions: {
    type: string
    params: any
  }[]
}

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly messageService: MessageService,
    private readonly notificationService: NotificationService,
    private readonly analyticsService: AnalyticsService,
    @InjectQueue('campaign')
    private readonly campaignQueue: BullQueue
  ) {}

  async createCampaign(data: {
    name: string
    description?: string
    template: CampaignTemplate
    rules: CampaignRule[]
    schedule?: {
      startDate: Date
      endDate?: Date
      frequency?: string
      timezone?: string
    }
    targetAudience?: {
      filters: any[]
      excludeFilters?: any[]
    }
    settings?: {
      maxMessages?: number
      cooldownPeriod?: number
      abTest?: {
        enabled: boolean
        variants: any[]
      }
    }
  }) {
    const campaign = this.campaignRepository.create(data)
    await this.campaignRepository.save(campaign)

    if (data.schedule) {
      await this.scheduleCampaign(campaign)
    }

    return campaign
  }

  private async scheduleCampaign(campaign: Campaign) {
    const { schedule } = campaign

    if (schedule.frequency) {
      // 创建重复任务
      await this.campaignQueue.add(
        'recurring',
        { campaignId: campaign.id },
        {
          repeat: {
            cron: this.frequencyToCron(schedule.frequency),
            tz: schedule.timezone || 'UTC'
          }
        }
      )
    } else {
      // 创建一次性任务
      await this.campaignQueue.add(
        'oneTime',
        { campaignId: campaign.id },
        {
          delay: new Date(schedule.startDate).getTime() - Date.now()
        }
      )
    }
  }

  private frequencyToCron(frequency: string): string {
    // 将频率转换为cron表达式
    const frequencies = {
      daily: '0 0 * * *',
      weekly: '0 0 * * 0',
      monthly: '0 0 1 * *'
    }
    return frequencies[frequency] || frequency
  }

  async executeCampaign(campaignId: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId }
    })

    if (!campaign) {
      throw new Error('Campaign not found')
    }

    // 获取目标用户
    const targetUsers = await this.getTargetUsers(
      campaign.targetAudience
    )

    // 如果启用了A/B测试
    if (campaign.settings?.abTest?.enabled) {
      await this.executeABTest(campaign, targetUsers)
    } else {
      // 常规执行
      await this.sendCampaignMessages(
        campaign,
        targetUsers,
        campaign.template
      )
    }

    // 更新活动状态
    campaign.lastExecutedAt = new Date()
    campaign.executionCount++
    await this.campaignRepository.save(campaign)
  }

  private async getTargetUsers(targetAudience: any) {
    const query = this.userRepository.createQueryBuilder('user')

    if (targetAudience?.filters) {
      targetAudience.filters.forEach((filter: any) => {
        this.applyFilter(query, filter)
      })
    }

    if (targetAudience?.excludeFilters) {
      targetAudience.excludeFilters.forEach((filter: any) => {
        this.applyExcludeFilter(query, filter)
      })
    }

    return query.getMany()
  }

  private applyFilter(query: any, filter: any) {
    switch (filter.type) {
      case 'attribute':
        query.andWhere(`user.${filter.field} ${filter.operator} :value`, {
          value: filter.value
        })
        break
      case 'behavior':
        // 根据用户行为筛选
        query
          .leftJoin('user.actions', 'action')
          .andWhere('action.type = :actionType', {
            actionType: filter.actionType
          })
          .andWhere('action.createdAt >= :since', {
            since: filter.since
          })
        break
      case 'segment':
        query
          .leftJoin('user.segments', 'segment')
          .andWhere('segment.id = :segmentId', {
            segmentId: filter.segmentId
          })
        break
    }
  }

  private applyExcludeFilter(query: any, filter: any) {
    // 类似applyFilter，但使用NOT操作符
    query.andWhere(`NOT (${filter.condition})`)
  }

  private async executeABTest(
    campaign: Campaign,
    users: User[]
  ) {
    const { variants } = campaign.settings.abTest
    const variantSize = Math.floor(users.length / variants.length)

    // 随机分配用户到不同变体
    const shuffledUsers = this.shuffleArray([...users])
    const variantGroups = variants.map((variant, index) =>
      shuffledUsers.slice(
        index * variantSize,
        (index + 1) * variantSize
      )
    )

    // 并行执行各个变体
    await Promise.all(
      variants.map((variant, index) =>
        this.sendCampaignMessages(
          campaign,
          variantGroups[index],
          variant.template
        )
      )
    )

    // 记录A/B测试数据
    await this.recordABTestData(campaign, variants)
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  private async sendCampaignMessages(
    campaign: Campaign,
    users: User[],
    template: CampaignTemplate
  ) {
    for (const user of users) {
      // 检查发送限制
      if (
        await this.checkMessageLimits(
          campaign,
          user
        )
      ) {
        continue
      }

      // 个性化消息内容
      const content = await this.personalizeContent(
        template.content,
        user
      )

      // 根据类型发送消息
      switch (template.type) {
        case 'email':
          await this.notificationService.sendEmail(
            user.email,
            content
          )
          break
        case 'push':
          await this.notificationService.sendPush(
            user.id,
            content
          )
          break
        case 'in-app':
          await this.messageService.createMessage({
            content,
            senderId: 'system',
            roomId: user.id,
            type: 'MARKETING'
          })
          break
      }

      // 记录发送历史
      await this.recordMessageSent(campaign, user)
    }
  }

  private async checkMessageLimits(
    campaign: Campaign,
    user: User
  ) {
    const { maxMessages, cooldownPeriod } = campaign.settings

    if (maxMessages) {
      const sentCount = await this.getSentMessageCount(
        campaign,
        user
      )
      if (sentCount >= maxMessages) {
        return true
      }
    }

    if (cooldownPeriod) {
      const lastSent = await this.getLastMessageSent(
        campaign,
        user
      )
      if (
        lastSent &&
        Date.now() - lastSent.getTime() < cooldownPeriod
      ) {
        return true
      }
    }

    return false
  }

  private async personalizeContent(
    content: string,
    user: User
  ) {
    // 替换变量
    return content.replace(
      /\{\{(.*?)\}\}/g,
      (match, variable) => {
        switch (variable.trim()) {
          case 'name':
            return user.name
          case 'email':
            return user.email
          default:
            return match
        }
      }
    )
  }

  private async recordMessageSent(
    campaign: Campaign,
    user: User
  ) {
    // 记录消息发送历史
    await this.campaignRepository
      .createQueryBuilder()
      .relation(Campaign, 'messageHistory')
      .of(campaign)
      .add({
        userId: user.id,
        sentAt: new Date(),
        status: 'sent'
      })
  }

  private async recordABTestData(
    campaign: Campaign,
    variants: any[]
  ) {
    // 记录A/B测试结果
    const variantResults = await Promise.all(
      variants.map(async variant => {
        const metrics = await this.analyticsService.getVariantMetrics(
          campaign.id,
          variant.id
        )
        return {
          variantId: variant.id,
          metrics
        }
      })
    )

    await this.campaignRepository.update(campaign.id, {
      abTestResults: variantResults
    })
  }

  async getCampaignAnalytics(campaignId: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['messageHistory']
    })

    if (!campaign) {
      throw new Error('Campaign not found')
    }

    const analytics = {
      delivered: campaign.messageHistory.length,
      opened: await this.countMessageEvents(
        campaignId,
        'opened'
      ),
      clicked: await this.countMessageEvents(
        campaignId,
        'clicked'
      ),
      converted: await this.countMessageEvents(
        campaignId,
        'converted'
      ),
      timeline: await this.getMessageTimeline(campaign),
      engagement: await this.getEngagementMetrics(campaign),
      abTestResults: campaign.settings?.abTest?.enabled
        ? campaign.abTestResults
        : null
    }

    return analytics
  }

  private async countMessageEvents(
    campaignId: string,
    eventType: string
  ) {
    return this.campaignRepository
      .createQueryBuilder()
      .relation(Campaign, 'messageHistory')
      .of(campaignId)
      .where('event = :eventType', { eventType })
      .getCount()
  }

  private async getMessageTimeline(campaign: Campaign) {
    return this.campaignRepository
      .createQueryBuilder()
      .select('DATE(sentAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .from('message_history', 'history')
      .where('campaignId = :campaignId', {
        campaignId: campaign.id
      })
      .groupBy('date')
      .getRawMany()
  }

  private async getEngagementMetrics(campaign: Campaign) {
    // 计算参与度指标
    const totalSent = campaign.messageHistory.length
    const metrics = {
      openRate:
        (await this.countMessageEvents(
          campaign.id,
          'opened'
        )) / totalSent,
      clickRate:
        (await this.countMessageEvents(
          campaign.id,
          'clicked'
        )) / totalSent,
      conversionRate:
        (await this.countMessageEvents(
          campaign.id,
          'converted'
        )) / totalSent
    }

    return metrics
  }
}
