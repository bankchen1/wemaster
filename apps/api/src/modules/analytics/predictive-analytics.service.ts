import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BullQueue } from '@nestjs/bull'
import { InjectQueue } from '@nestjs/bull'
import * as tf from '@tensorflow/tfjs-node'
import * as brain from 'brain.js'
import { Message } from '../message/message.entity'
import { User } from '../user/user.entity'
import { Campaign } from '../marketing/campaign.entity'

@Injectable()
export class PredictiveAnalyticsService {
  private userEngagementModel: tf.Sequential
  private sentimentModel: brain.NeuralNetwork
  private readonly modelPath = './models'

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectQueue('analytics')
    private readonly analyticsQueue: BullQueue
  ) {
    this.initializeModels()
  }

  private async initializeModels() {
    // 初始化TensorFlow模型
    this.userEngagementModel = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [10],
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid'
        })
      ]
    })

    // 初始化Brain.js模型
    this.sentimentModel = new brain.NeuralNetwork({
      hiddenLayers: [10, 5]
    })

    // 加载预训练模型
    await this.loadModels()
  }

  private async loadModels() {
    try {
      // 加载TensorFlow模型
      const savedModel = await tf.loadLayersModel(
        `file://${this.modelPath}/engagement-model/model.json`
      )
      this.userEngagementModel.setWeights(
        savedModel.getWeights()
      )

      // 加载Brain.js模型
      const savedSentimentModel = require(`${this.modelPath}/sentiment-model.json`)
      this.sentimentModel.fromJSON(savedSentimentModel)
    } catch (error) {
      console.log('No pre-trained models found, using new models')
    }
  }

  async predictUserEngagement(userId: string) {
    // 获取用户历史数据
    const userData = await this.getUserFeatures(userId)
    
    // 转换为张量
    const inputTensor = tf.tensor2d([userData], [1, 10])
    
    // 预测
    const prediction = this.userEngagementModel.predict(
      inputTensor
    ) as tf.Tensor

    const engagementScore = await prediction.data()

    // 清理内存
    inputTensor.dispose()
    prediction.dispose()

    return {
      userId,
      engagementScore: engagementScore[0],
      predictedActions: await this.getPredictedActions(
        engagementScore[0]
      )
    }
  }

  private async getUserFeatures(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['messages', 'actions']
    })

    // 提取特征
    return [
      user.messages.length, // 消息数量
      this.calculateMessageFrequency(user.messages), // 消息频率
      this.calculateResponseRate(user.messages), // 响应率
      this.calculateAverageResponseTime(user.messages), // 平均响应时间
      user.actions.length, // 操作数量
      this.calculateActionFrequency(user.actions), // 操作频率
      this.calculateEngagementScore(user), // 参与度分数
      this.calculateRetentionScore(user), // 留存分数
      this.calculateSentimentScore(user.messages), // 情感分数
      Date.now() - user.createdAt.getTime() // 账户年龄
    ]
  }

  private calculateMessageFrequency(messages: Message[]) {
    if (messages.length < 2) return 0
    const timeSpan =
      messages[messages.length - 1].createdAt.getTime() -
      messages[0].createdAt.getTime()
    return (messages.length / timeSpan) * 86400000 // 转换为每天
  }

  private calculateResponseRate(messages: Message[]) {
    const responses = messages.filter(
      (m, i) =>
        i > 0 &&
        m.sender.id !==
          messages[i - 1].sender.id &&
        m.createdAt.getTime() -
          messages[i - 1].createdAt.getTime() <
          3600000 // 1小时内的回复
    )
    return messages.length ? responses.length / messages.length : 0
  }

  private calculateAverageResponseTime(messages: Message[]) {
    const responseTimes = messages
      .map((m, i) => {
        if (
          i > 0 &&
          m.sender.id !== messages[i - 1].sender.id
        ) {
          return (
            m.createdAt.getTime() -
            messages[i - 1].createdAt.getTime()
          )
        }
        return null
      })
      .filter(time => time !== null)

    return responseTimes.length
      ? responseTimes.reduce((a, b) => a + b, 0) /
          responseTimes.length
      : 0
  }

  private calculateActionFrequency(actions: any[]) {
    if (actions.length < 2) return 0
    const timeSpan =
      actions[actions.length - 1].createdAt.getTime() -
      actions[0].createdAt.getTime()
    return (actions.length / timeSpan) * 86400000
  }

  private calculateEngagementScore(user: User) {
    // 综合计算参与度分数
    const messageScore = user.messages.length * 0.4
    const actionScore = user.actions.length * 0.3
    const responseScore = this.calculateResponseRate(user.messages) * 0.3
    return messageScore + actionScore + responseScore
  }

  private calculateRetentionScore(user: User) {
    // 计算留存分数
    const daysSinceLastAction = Math.min(
      (Date.now() -
        Math.max(
          ...user.actions.map(a => a.createdAt.getTime())
        )) /
        86400000,
      30
    )
    return Math.exp(-daysSinceLastAction / 30)
  }

  private calculateSentimentScore(messages: Message[]) {
    // 使用Brain.js进行情感分析
    const sentiments = messages.map(message =>
      this.sentimentModel.run(this.preprocessText(message.content))
    )
    return sentiments.reduce((a, b) => a + b, 0) / sentiments.length
  }

  private preprocessText(text: string) {
    // 文本预处理
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .map(word => this.wordToVector(word))
  }

  private wordToVector(word: string) {
    // 简单的词向量化
    return Array.from(word).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    ) / 1000
  }

  private async getPredictedActions(engagementScore: number) {
    // 基于参与度分数推荐行动
    const actions = []
    
    if (engagementScore < 0.3) {
      actions.push({
        type: 'REACTIVATION',
        priority: 'HIGH',
        suggestion: '发送重新激活邮件'
      })
    } else if (engagementScore < 0.6) {
      actions.push({
        type: 'ENGAGEMENT',
        priority: 'MEDIUM',
        suggestion: '发送个性化内容推荐'
      })
    } else {
      actions.push({
        type: 'RETENTION',
        priority: 'LOW',
        suggestion: '发送忠诚度奖励'
      })
    }

    return actions
  }

  async trainModels() {
    // 获取训练数据
    const trainingData = await this.getTrainingData()

    // 训练参与度模型
    await this.trainEngagementModel(trainingData)

    // 训练情感分析模型
    await this.trainSentimentModel(trainingData)

    // 保存模型
    await this.saveModels()
  }

  private async getTrainingData() {
    // 获取用户数据用于训练
    const users = await this.userRepository.find({
      relations: ['messages', 'actions']
    })

    return users.map(user => ({
      features: this.getUserFeatures(user.id),
      engagementLabel: this.calculateEngagementScore(user),
      sentimentLabels: user.messages.map(m => ({
        input: this.preprocessText(m.content),
        output: this.getSentimentLabel(m)
      }))
    }))
  }

  private async trainEngagementModel(trainingData: any[]) {
    const features = tf.tensor2d(
      trainingData.map(d => d.features)
    )
    const labels = tf.tensor2d(
      trainingData.map(d => [d.engagementLabel])
    )

    await this.userEngagementModel.fit(features, labels, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(
            `Epoch ${epoch}: loss = ${logs.loss}`
          )
        }
      }
    })

    features.dispose()
    labels.dispose()
  }

  private async trainSentimentModel(trainingData: any[]) {
    const sentimentData = trainingData
      .flatMap(d => d.sentimentLabels)
      .filter(d => d.output !== null)

    this.sentimentModel.train(sentimentData, {
      iterations: 2000,
      errorThresh: 0.005,
      log: true,
      logPeriod: 100
    })
  }

  private getSentimentLabel(message: Message) {
    // 简单的情感标签生成
    const positiveWords = ['good', 'great', 'awesome', 'thanks']
    const negativeWords = ['bad', 'poor', 'sorry', 'issue']

    const content = message.content.toLowerCase()
    let score = 0

    positiveWords.forEach(word => {
      if (content.includes(word)) score += 1
    })

    negativeWords.forEach(word => {
      if (content.includes(word)) score -= 1
    })

    return Math.max(0, Math.min(1, (score + 1) / 2))
  }

  private async saveModels() {
    // 保存TensorFlow模型
    await this.userEngagementModel.save(
      `file://${this.modelPath}/engagement-model`
    )

    // 保存Brain.js模型
    const sentimentModelJson = this.sentimentModel.toJSON()
    require('fs').writeFileSync(
      `${this.modelPath}/sentiment-model.json`,
      JSON.stringify(sentimentModelJson)
    )
  }

  async getOptimizationRecommendations(data: any) {
    // 基于预测分析生成优化建议
    const recommendations = {
      timing: await this.getOptimalTiming(data),
      targeting: await this.getTargetingRecommendations(data),
      content: await this.getContentRecommendations(data)
    }

    return recommendations
  }

  private async getOptimalTiming(data: any) {
    // 分析最佳发送时间
    const engagementByHour = new Array(24).fill(0)
    data.messages.forEach(message => {
      const hour = new Date(message.createdAt).getHours()
      engagementByHour[hour] += message.engagement
    })

    const optimalHour = engagementByHour.indexOf(
      Math.max(...engagementByHour)
    )

    return {
      hour: optimalHour,
      confidence: this.calculateConfidence(engagementByHour)
    }
  }

  private async getTargetingRecommendations(data: any) {
    // 分析目标用户特征
    const userSegments = await this.analyzeUserSegments(
      data.users
    )

    return {
      segments: userSegments,
      recommendations: this.generateTargetingStrategies(
        userSegments
      )
    }
  }

  private async getContentRecommendations(data: any) {
    // 分析内容效果
    const contentAnalysis = await this.analyzeContentPerformance(
      data.messages
    )

    return {
      topPerforming: contentAnalysis.top,
      improvements: this.generateContentImprovements(
        contentAnalysis
      )
    }
  }

  private calculateConfidence(data: number[]) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length
    const variance =
      data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      data.length
    return 1 / (1 + Math.sqrt(variance))
  }

  private async analyzeUserSegments(users: User[]) {
    // 使用聚类算法分析用户群体
    const features = users.map(user =>
      this.getUserFeatures(user.id)
    )

    const segments = await this.performClustering(features)

    return segments.map((segment, i) => ({
      id: i,
      size: segment.length,
      characteristics: this.getSegmentCharacteristics(
        segment,
        users
      )
    }))
  }

  private async performClustering(features: number[][]) {
    // 简单的K-means聚类
    const k = 3 // 聚类数量
    const centroids = features.slice(0, k)
    const clusters = new Array(k).fill([])

    for (let iter = 0; iter < 10; iter++) {
      // 分配点到最近的中心
      clusters.fill([])
      features.forEach((feature, i) => {
        const distances = centroids.map(centroid =>
          this.euclideanDistance(feature, centroid)
        )
        const closestCentroid = distances.indexOf(
          Math.min(...distances)
        )
        clusters[closestCentroid].push(i)
      })

      // 更新中心点
      clusters.forEach((cluster, i) => {
        if (cluster.length > 0) {
          centroids[i] = this.calculateCentroid(
            cluster.map(idx => features[idx])
          )
        }
      })
    }

    return clusters
  }

  private euclideanDistance(a: number[], b: number[]) {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    )
  }

  private calculateCentroid(points: number[][]) {
    const n = points.length
    return points[0].map(
      (_, i) =>
        points.reduce((sum, p) => sum + p[i], 0) / n
    )
  }

  private getSegmentCharacteristics(
    segment: number[],
    users: User[]
  ) {
    const segmentUsers = segment.map(i => users[i])
    
    return {
      avgEngagement: this.calculateAverageEngagement(
        segmentUsers
      ),
      commonTraits: this.findCommonTraits(segmentUsers),
      behaviorPatterns: this.analyzeBehaviorPatterns(
        segmentUsers
      )
    }
  }

  private calculateAverageEngagement(users: User[]) {
    return (
      users.reduce(
        (sum, user) => sum + this.calculateEngagementScore(user),
        0
      ) / users.length
    )
  }

  private findCommonTraits(users: User[]) {
    // 分析用户共同特征
    return {
      // 实现特征提取逻辑
    }
  }

  private analyzeBehaviorPatterns(users: User[]) {
    // 分析行为模式
    return {
      // 实现行为分析逻辑
    }
  }

  private generateTargetingStrategies(segments: any[]) {
    return segments.map(segment => ({
      segmentId: segment.id,
      strategy: this.createTargetingStrategy(segment)
    }))
  }

  private createTargetingStrategy(segment: any) {
    // 基于段特征创建定向策略
    return {
      // 实现策略生成逻辑
    }
  }

  private async analyzeContentPerformance(messages: Message[]) {
    // 分析内容性能
    const performance = messages.map(message => ({
      content: message.content,
      engagement: await this.calculateMessageEngagement(
        message
      )
    }))

    return {
      top: performance
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5),
      patterns: this.findContentPatterns(performance)
    }
  }

  private async calculateMessageEngagement(message: Message) {
    // 计算消息参与度
    return {
      // 实现参与度计算逻辑
    }
  }

  private findContentPatterns(performance: any[]) {
    // 分析内容模式
    return {
      // 实现模式分析逻辑
    }
  }

  private generateContentImprovements(analysis: any) {
    // 生成内容改进建议
    return {
      // 实现建议生成逻辑
    }
  }
}
