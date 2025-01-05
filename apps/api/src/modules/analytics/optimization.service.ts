import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from '../message/message.entity'
import { User } from '../user/user.entity'
import { Campaign } from '../marketing/campaign.entity'
import { PredictiveAnalyticsService } from './predictive-analytics.service'
import * as tf from '@tensorflow/tfjs-node'

@Injectable()
export class OptimizationService {
  private readonly optimizationModel: tf.Sequential

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    private readonly predictiveAnalytics: PredictiveAnalyticsService
  ) {
    this.initializeModel()
  }

  private initializeModel() {
    this.optimizationModel = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [20],
          units: 128,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 10,
          activation: 'softmax'
        })
      ]
    })

    this.optimizationModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })
  }

  async optimizeCampaign(campaignId: string) {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['messageHistory', 'targetAudience']
    })

    if (!campaign) {
      throw new Error('Campaign not found')
    }

    // 获取历史数据
    const historicalData = await this.getHistoricalData(
      campaign
    )

    // 生成优化建议
    const optimizations = await this.generateOptimizations(
      campaign,
      historicalData
    )

    // 应用优化
    await this.applyOptimizations(campaign, optimizations)

    return optimizations
  }

  private async getHistoricalData(campaign: Campaign) {
    // 收集相关的历史数据
    const messages = await this.messageRepository.find({
      where: { campaign: { id: campaign.id } },
      relations: ['sender', 'recipient']
    })

    const users = await this.userRepository.find({
      where: { id: campaign.targetAudience.map(u => u.id) }
    })

    return {
      messages,
      users,
      engagementMetrics: await this.calculateEngagementMetrics(
        messages
      ),
      userSegments: await this.predictiveAnalytics.analyzeUserSegments(
        users
      )
    }
  }

  private async calculateEngagementMetrics(messages: Message[]) {
    const metrics = {
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      responseTime: 0,
      engagementScore: 0
    }

    if (messages.length === 0) return metrics

    const opens = messages.filter(m => m.metadata?.opened)
    const clicks = messages.filter(m => m.metadata?.clicked)
    const conversions = messages.filter(
      m => m.metadata?.converted
    )

    metrics.openRate = opens.length / messages.length
    metrics.clickRate = clicks.length / messages.length
    metrics.conversionRate =
      conversions.length / messages.length

    // 计算平均响应时间
    const responseTimes = messages
      .filter(m => m.metadata?.responseTime)
      .map(m => m.metadata.responseTime)
    metrics.responseTime =
      responseTimes.reduce((a, b) => a + b, 0) /
      responseTimes.length

    // 计算综合参与度分数
    metrics.engagementScore =
      metrics.openRate * 0.3 +
      metrics.clickRate * 0.3 +
      metrics.conversionRate * 0.4

    return metrics
  }

  private async generateOptimizations(
    campaign: Campaign,
    historicalData: any
  ) {
    // 使用机器学习模型生成优化建议
    const features = await this.extractFeatures(
      campaign,
      historicalData
    )
    const predictions = await this.predictOptimizations(
      features
    )

    return {
      timing: this.optimizeTiming(predictions, historicalData),
      content: this.optimizeContent(
        predictions,
        historicalData
      ),
      targeting: this.optimizeTargeting(
        predictions,
        historicalData
      ),
      delivery: this.optimizeDelivery(
        predictions,
        historicalData
      )
    }
  }

  private async extractFeatures(
    campaign: Campaign,
    historicalData: any
  ) {
    // 提取用于优化的特征
    const features = []

    // 活动特征
    features.push(
      campaign.messageHistory.length, // 消息数量
      historicalData.engagementMetrics.openRate,
      historicalData.engagementMetrics.clickRate,
      historicalData.engagementMetrics.conversionRate,
      historicalData.engagementMetrics.responseTime
    )

    // 用户特征
    const userFeatures = await Promise.all(
      historicalData.users.map(user =>
        this.predictiveAnalytics.predictUserEngagement(
          user.id
        )
      )
    )

    features.push(
      ...this.aggregateUserFeatures(userFeatures)
    )

    return features
  }

  private aggregateUserFeatures(userFeatures: any[]) {
    // 聚合用户特征
    return [
      // 平均参与度
      userFeatures.reduce(
        (sum, f) => sum + f.engagementScore,
        0
      ) / userFeatures.length,
      // 参与度方差
      this.calculateVariance(
        userFeatures.map(f => f.engagementScore)
      ),
      // 其他聚合特征...
    ]
  }

  private calculateVariance(values: number[]) {
    const mean =
      values.reduce((a, b) => a + b, 0) / values.length
    return (
      values.reduce(
        (sum, val) => sum + Math.pow(val - mean, 2),
        0
      ) / values.length
    )
  }

  private async predictOptimizations(features: number[]) {
    // 使用优化模型进行预测
    const inputTensor = tf.tensor2d([features])
    const predictions = this.optimizationModel.predict(
      inputTensor
    ) as tf.Tensor

    const results = await predictions.data()

    inputTensor.dispose()
    predictions.dispose()

    return Array.from(results)
  }

  private optimizeTiming(
    predictions: number[],
    historicalData: any
  ) {
    // 优化发送时间
    const engagementByHour = new Array(24).fill(0)
    historicalData.messages.forEach(message => {
      const hour = new Date(message.createdAt).getHours()
      engagementByHour[hour] += message.metadata?.engagement || 0
    })

    const optimalHours = engagementByHour
      .map((value, hour) => ({ hour, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(({ hour }) => hour)

    return {
      optimalHours,
      recommendedDays: this.getRecommendedDays(
        historicalData
      ),
      frequency: this.optimizeFrequency(historicalData)
    }
  }

  private getRecommendedDays(historicalData: any) {
    // 分析最佳发送日期
    const engagementByDay = new Array(7).fill(0)
    historicalData.messages.forEach(message => {
      const day = new Date(message.createdAt).getDay()
      engagementByDay[day] += message.metadata?.engagement || 0
    })

    return engagementByDay
      .map((value, day) => ({ day, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(({ day }) => day)
  }

  private optimizeFrequency(historicalData: any) {
    // 优化发送频率
    const userEngagements = historicalData.users.map(user => {
      const userMessages = historicalData.messages.filter(
        m => m.recipient.id === user.id
      )
      return this.analyzeUserFrequency(userMessages)
    })

    return this.aggregateFrequencyRecommendations(
      userEngagements
    )
  }

  private analyzeUserFrequency(messages: Message[]) {
    if (messages.length < 2) return null

    const intervals = []
    for (let i = 1; i < messages.length; i++) {
      intervals.push(
        messages[i].createdAt.getTime() -
          messages[i - 1].createdAt.getTime()
      )
    }

    return {
      averageInterval:
        intervals.reduce((a, b) => a + b, 0) /
        intervals.length,
      engagement: messages.reduce(
        (sum, m) => sum + (m.metadata?.engagement || 0),
        0
      )
    }
  }

  private aggregateFrequencyRecommendations(
    userEngagements: any[]
  ) {
    const validEngagements = userEngagements.filter(
      e => e !== null
    )
    if (validEngagements.length === 0) return null

    // 按参与度加权的平均间隔
    const weightedIntervals = validEngagements.map(e => ({
      interval: e.averageInterval,
      weight: e.engagement
    }))

    const totalWeight = weightedIntervals.reduce(
      (sum, wi) => sum + wi.weight,
      0
    )

    const recommendedInterval =
      weightedIntervals.reduce(
        (sum, wi) => sum + wi.interval * wi.weight,
        0
      ) / totalWeight

    return {
      recommendedInterval,
      confidence: this.calculateConfidence(
        weightedIntervals.map(wi => wi.interval)
      )
    }
  }

  private calculateConfidence(values: number[]) {
    const mean =
      values.reduce((a, b) => a + b, 0) / values.length
    const variance =
      values.reduce(
        (sum, val) => sum + Math.pow(val - mean, 2),
        0
      ) / values.length
    return 1 / (1 + Math.sqrt(variance))
  }

  private optimizeContent(
    predictions: number[],
    historicalData: any
  ) {
    // 优化内容
    return {
      recommendedTemplates: this.getTopPerformingTemplates(
        historicalData
      ),
      contentSuggestions: this.generateContentSuggestions(
        historicalData
      ),
      personalization: this.optimizePersonalization(
        historicalData
      )
    }
  }

  private getTopPerformingTemplates(historicalData: any) {
    // 分析表现最好的模板
    const templatePerformance = {}
    historicalData.messages.forEach(message => {
      const templateId = message.metadata?.templateId
      if (!templateId) return

      templatePerformance[templateId] =
        templatePerformance[templateId] || {
          uses: 0,
          engagement: 0
        }
      templatePerformance[templateId].uses++
      templatePerformance[templateId].engagement +=
        message.metadata?.engagement || 0
    })

    return Object.entries(templatePerformance)
      .map(([id, perf]: [string, any]) => ({
        id,
        averageEngagement: perf.engagement / perf.uses
      }))
      .sort((a, b) => b.averageEngagement - a.averageEngagement)
      .slice(0, 5)
  }

  private generateContentSuggestions(historicalData: any) {
    // 生成内容改进建议
    return {
      // 实现内容建议生成逻辑
    }
  }

  private optimizePersonalization(historicalData: any) {
    // 优化个性化策略
    return {
      // 实现个性化优化逻辑
    }
  }

  private optimizeTargeting(
    predictions: number[],
    historicalData: any
  ) {
    // 优化目标受众
    return {
      segments: this.optimizeSegments(historicalData),
      exclusions: this.identifyExclusions(historicalData),
      expansion: this.suggestAudienceExpansion(
        historicalData
      )
    }
  }

  private optimizeSegments(historicalData: any) {
    // 优化用户分段
    return {
      // 实现分段优化逻辑
    }
  }

  private identifyExclusions(historicalData: any) {
    // 识别应该排除的用户
    return {
      // 实现排除逻辑
    }
  }

  private suggestAudienceExpansion(historicalData: any) {
    // 建议扩展受众
    return {
      // 实现受众扩展建议逻辑
    }
  }

  private optimizeDelivery(
    predictions: number[],
    historicalData: any
  ) {
    // 优化发送策略
    return {
      channels: this.optimizeChannels(historicalData),
      pacing: this.optimizePacing(historicalData),
      testing: this.suggestTestingStrategy(historicalData)
    }
  }

  private optimizeChannels(historicalData: any) {
    // 优化渠道选择
    return {
      // 实现渠道优化逻辑
    }
  }

  private optimizePacing(historicalData: any) {
    // 优化发送节奏
    return {
      // 实现节奏优化逻辑
    }
  }

  private suggestTestingStrategy(historicalData: any) {
    // 建议测试策略
    return {
      // 实现测试策略建议逻辑
    }
  }

  private async applyOptimizations(
    campaign: Campaign,
    optimizations: any
  ) {
    // 应用优化建议
    campaign.schedule = this.updateSchedule(
      campaign.schedule,
      optimizations.timing
    )
    campaign.template = this.updateTemplate(
      campaign.template,
      optimizations.content
    )
    campaign.targetAudience = this.updateTargeting(
      campaign.targetAudience,
      optimizations.targeting
    )
    campaign.deliverySettings = this.updateDelivery(
      campaign.deliverySettings,
      optimizations.delivery
    )

    await this.campaignRepository.save(campaign)
  }

  private updateSchedule(currentSchedule: any, timing: any) {
    return {
      ...currentSchedule,
      optimalHours: timing.optimalHours,
      recommendedDays: timing.recommendedDays,
      frequency: timing.frequency.recommendedInterval
    }
  }

  private updateTemplate(currentTemplate: any, content: any) {
    return {
      ...currentTemplate,
      recommendedTemplates: content.recommendedTemplates,
      personalization: content.personalization
    }
  }

  private updateTargeting(
    currentTargeting: any,
    targeting: any
  ) {
    return {
      ...currentTargeting,
      segments: targeting.segments,
      exclusions: targeting.exclusions,
      expansion: targeting.expansion
    }
  }

  private updateDelivery(
    currentSettings: any,
    delivery: any
  ) {
    return {
      ...currentSettings,
      channels: delivery.channels,
      pacing: delivery.pacing,
      testing: delivery.testing
    }
  }
}
