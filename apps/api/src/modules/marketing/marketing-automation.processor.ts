import { Process, Processor } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Job } from 'bull'
import { User } from '../user/user.entity'
import { MarketingAutomationService } from './marketing-automation.service'
import { MonitoringService } from '../monitoring/monitoring.service'

@Processor('marketing-automation')
@Injectable()
export class MarketingAutomationProcessor {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private marketingService: MarketingAutomationService,
    private monitoringService: MonitoringService
  ) {}

  @Process('process-template')
  async handleProcessTemplate(job: Job) {
    const { templateId, userId, data } = job.data

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId }
      })

      if (!user) {
        throw new Error(`User not found: ${userId}`)
      }

      const template = await this.marketingService.getTemplate(
        templateId
      )

      if (!template) {
        throw new Error(`Template not found: ${templateId}`)
      }

      // 检查用户是否符合目标受众
      if (
        this.checkAudienceMatch(user, template.audience)
      ) {
        await this.marketingService.sendNotification(
          template,
          user,
          data
        )

        await this.monitoringService.incrementCounter(
          'marketing_notifications_sent',
          1,
          {
            templateId,
            channel: template.channel
          }
        )
      }
    } catch (error) {
      console.error(
        'Failed to process marketing template:',
        error
      )
      throw error
    }
  }

  @Process('weekly-promotion')
  async handleWeeklyPromotion(job: Job) {
    try {
      // 获取活跃学生
      const students = await this.userRepo.find({
        where: {
          role: 'student',
          status: 'active',
          tags: { $contains: ['interested_in_offers'] }
        }
      })

      // 获取本周优惠信息
      const promotions = await this.getWeeklyPromotions()

      // 发送优惠通知
      for (const student of students) {
        await this.marketingService.sendNotification(
          {
            id: 'weeklyPromotion',
            name: '每周优惠',
            type: 'promotion',
            channel: 'email',
            title: '本周特惠课程',
            content: this.generatePromotionContent(promotions),
            trigger: { event: 'schedule.weekly' },
            audience: {
              role: ['student'],
              status: ['active']
            }
          },
          student,
          { promotions }
        )
      }
    } catch (error) {
      console.error(
        'Failed to process weekly promotion:',
        error
      )
      throw error
    }
  }

  @Process('reactivate-users')
  async handleReactivateUsers(job: Job) {
    try {
      // 获取30天未活跃的用户
      const inactiveUsers = await this.userRepo.find({
        where: {
          status: 'inactive',
          lastActiveTime: {
            $lt: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            )
          }
        }
      })

      // 发送重新激活通知
      for (const user of inactiveUsers) {
        await this.marketingService.sendNotification(
          {
            id: 'reactivation',
            name: '重新激活',
            type: 'promotion',
            channel: 'push',
            title: '我们想念您！',
            content:
              '回来看看有什么新课程吧，有特别优惠等着您！',
            trigger: {
              condition: {
                lastActiveTime: { $lt: 'now-30d' }
              }
            },
            audience: {
              role: ['student'],
              status: ['inactive']
            }
          },
          user
        )
      }
    } catch (error) {
      console.error(
        'Failed to process user reactivation:',
        error
      )
      throw error
    }
  }

  private checkAudienceMatch(
    user: User,
    audience: any
  ): boolean {
    if (
      audience.role &&
      !audience.role.includes(user.role)
    ) {
      return false
    }

    if (
      audience.status &&
      !audience.status.includes(user.status)
    ) {
      return false
    }

    if (audience.tags) {
      const userTags = user.tags || []
      if (
        !audience.tags.some((tag: string) =>
          userTags.includes(tag)
        )
      ) {
        return false
      }
    }

    if (audience.customFilter) {
      // 实现自定义过滤逻辑
    }

    return true
  }

  private async getWeeklyPromotions() {
    // 实现获取本周优惠信息的逻辑
    return []
  }

  private generatePromotionContent(promotions: any[]): string {
    // 实现生成优惠内容的逻辑
    return ''
  }
}
