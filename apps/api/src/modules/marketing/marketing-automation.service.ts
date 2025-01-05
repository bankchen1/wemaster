import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../user/user.entity'
import { NotificationService } from '../notification/notification.service'
import { CacheService } from '../cache/cache.service'
import { MonitoringService } from '../monitoring/monitoring.service'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import * as webpush from 'web-push'
import * as nodemailer from 'nodemailer'
import * as Twilio from 'twilio'

interface MarketingTemplate {
  id: string
  name: string
  type: 'system' | 'event' | 'reminder' | 'promotion' | 'guide'
  channel: 'in-app' | 'email' | 'sms' | 'push'
  title: string
  content: string
  trigger: {
    event?: string
    delay?: number
    condition?: any
  }
  audience: {
    role?: string[]
    status?: string[]
    tags?: string[]
    customFilter?: any
  }
}

@Injectable()
export class MarketingAutomationService {
  private readonly twilioClient: Twilio.Twilio
  private readonly emailTransporter: nodemailer.Transporter

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationService: NotificationService,
    private cacheService: CacheService,
    private monitoringService: MonitoringService,
    private configService: ConfigService,
    @InjectQueue('marketing-automation')
    private marketingQueue: Queue
  ) {
    // 初始化 Web Push
    webpush.setVapidDetails(
      'mailto:support@wepal.com',
      configService.get('VAPID_PUBLIC_KEY'),
      configService.get('VAPID_PRIVATE_KEY')
    )

    // 初始化 Twilio
    this.twilioClient = Twilio(
      configService.get('TWILIO_ACCOUNT_SID'),
      configService.get('TWILIO_AUTH_TOKEN')
    )

    // 初始化 Nodemailer
    this.emailTransporter = nodemailer.createTransport({
      host: configService.get('SMTP_HOST'),
      port: configService.get('SMTP_PORT'),
      secure: true,
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASS')
      }
    })
  }

  // 系统通知模板
  private readonly systemTemplates: Record<string, MarketingTemplate> = {
    welcome: {
      id: 'welcome',
      name: '欢迎注册',
      type: 'system',
      channel: 'in-app',
      title: '欢迎加入 Wepal！',
      content: '感谢您注册 Wepal，让我们开始您的学习之旅吧！',
      trigger: {
        event: 'user.registered'
      },
      audience: {
        role: ['student']
      }
    },
    tutorWelcome: {
      id: 'tutorWelcome',
      name: '导师欢迎',
      type: 'system',
      channel: 'in-app',
      title: '欢迎成为 Wepal 导师！',
      content: '感谢您加入 Wepal 导师团队，让我们一起为学生提供优质的教学服务！',
      trigger: {
        event: 'tutor.approved'
      },
      audience: {
        role: ['tutor']
      }
    },
    completeProfile: {
      id: 'completeProfile',
      name: '完善资料提醒',
      type: 'guide',
      channel: 'email',
      title: '完善您的个人资料',
      content: '完善个人资料可以帮助您更好地展示自己，提高匹配效率。',
      trigger: {
        event: 'user.registered',
        delay: 24 * 60 * 60 // 24小时后
      },
      audience: {
        role: ['student', 'tutor'],
        condition: {
          profileCompleted: false
        }
      }
    }
  }

  // 事件通知模板
  private readonly eventTemplates: Record<string, MarketingTemplate> = {
    bookingConfirmed: {
      id: 'bookingConfirmed',
      name: '预约确认',
      type: 'event',
      channel: 'in-app',
      title: '课程预约成功',
      content: '您的课程已预约成功，请准时参加。',
      trigger: {
        event: 'booking.confirmed'
      },
      audience: {
        role: ['student']
      }
    },
    classReminder: {
      id: 'classReminder',
      name: '课程提醒',
      type: 'reminder',
      channel: 'sms',
      title: '课程即将开始',
      content: '您的课程将在30分钟后开始，请做好准备。',
      trigger: {
        event: 'class.upcoming',
        delay: -30 * 60 // 提前30分钟
      },
      audience: {
        role: ['student', 'tutor']
      }
    }
  }

  // 营销通知模板
  private readonly marketingTemplates: Record<string, MarketingTemplate> = {
    weeklyPromotion: {
      id: 'weeklyPromotion',
      name: '每周优惠',
      type: 'promotion',
      channel: 'email',
      title: '本周特惠课程',
      content: '查看本周特惠课程，开启您的学习之旅！',
      trigger: {
        event: 'schedule.weekly'
      },
      audience: {
        role: ['student'],
        status: ['active'],
        tags: ['interested_in_offers']
      }
    },
    reactivation: {
      id: 'reactivation',
      name: '重新激活',
      type: 'promotion',
      channel: 'push',
      title: '我们想念您！',
      content: '回来看看有什么新课程吧，有特别优惠等着您！',
      trigger: {
        condition: {
          lastActiveTime: {
            $lt: 'now-30d'
          }
        }
      },
      audience: {
        role: ['student'],
        status: ['inactive']
      }
    }
  }

  // 处理用户事件
  async handleUserEvent(event: string, userId: string, data?: any) {
    const templates = {
      ...this.systemTemplates,
      ...this.eventTemplates,
      ...this.marketingTemplates
    }

    // 找到所有匹配的模板
    const matchingTemplates = Object.values(templates).filter(
      template => template.trigger.event === event
    )

    for (const template of matchingTemplates) {
      await this.marketingQueue.add('process-template', {
        templateId: template.id,
        userId,
        data
      })
    }
  }

  // 发送通知
  async sendNotification(
    template: MarketingTemplate,
    user: User,
    data?: any
  ) {
    const content = this.processTemplate(template.content, {
      user,
      ...data
    })

    switch (template.channel) {
      case 'in-app':
        await this.notificationService.sendNotification({
          userId: user.id,
          type: template.type,
          title: template.title,
          message: content,
          data
        })
        break

      case 'email':
        if (user.email) {
          await this.sendEmail(user.email, template.title, content)
        }
        break

      case 'sms':
        if (user.phone) {
          await this.sendSMS(user.phone, content)
        }
        break

      case 'push':
        if (user.pushSubscription) {
          await this.sendPushNotification(
            user.pushSubscription,
            template.title,
            content
          )
        }
        break
    }
  }

  // 处理模板
  private processTemplate(template: string, data: any): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match
    })
  }

  // 发送邮件
  private async sendEmail(
    to: string,
    subject: string,
    content: string
  ) {
    await this.emailTransporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to,
      subject,
      html: content
    })
  }

  // 发送短信
  private async sendSMS(to: string, content: string) {
    await this.twilioClient.messages.create({
      body: content,
      to,
      from: this.configService.get('TWILIO_PHONE_NUMBER')
    })
  }

  // 发送推送通知
  private async sendPushNotification(
    subscription: PushSubscription,
    title: string,
    content: string
  ) {
    const payload = JSON.stringify({
      title,
      body: content,
      icon: '/assets/icons/notification-icon.png'
    })

    await webpush.sendNotification(subscription, payload)
  }

  // 注册推送订阅
  async registerPushSubscription(
    userId: string,
    subscription: PushSubscription
  ) {
    await this.userRepo.update(userId, {
      pushSubscription: subscription
    })
  }

  // 创建问题模板
  async createQuestionTemplate(tutorId: string, data: {
    title: string
    content: string
    type: string
  }) {
    // 创建问题记录
    const question = {
      tutorId,
      ...data,
      status: 'pending',
      createdAt: new Date()
    }

    // 发送通知给导师
    await this.notificationService.sendNotification({
      userId: tutorId,
      type: 'QUESTION_RECEIVED',
      title: '收到新的问题',
      message: `有学生向您提问：${data.title}`,
      data: { question }
    })

    return question
  }

  // 自动化营销任务
  async scheduleMarketingTasks() {
    // 每周优惠
    await this.marketingQueue.add(
      'weekly-promotion',
      {},
      {
        repeat: {
          cron: '0 0 * * 1' // 每周一
        }
      }
    )

    // 重新激活用户
    await this.marketingQueue.add(
      'reactivate-users',
      {},
      {
        repeat: {
          cron: '0 0 * * *' // 每天
        }
      }
    )
  }
}
