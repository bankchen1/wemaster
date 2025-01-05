import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { Message } from '../message/message.entity'
import { ChatRoom } from '../message/chat-room.entity'
import { User } from '../user/user.entity'
import * as moment from 'moment'

@Injectable()
export class MessageAnalyticsService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  async getMessageStats(params: {
    startDate?: Date
    endDate?: Date
    groupId?: string
    userId?: string
  }) {
    const { startDate, endDate, groupId, userId } = params
    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.room', 'room')
      .leftJoin('message.sender', 'sender')

    if (startDate && endDate) {
      query.andWhere('message.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
    }

    if (groupId) {
      query.andWhere('room.id = :groupId', { groupId })
    }

    if (userId) {
      query.andWhere('sender.id = :userId', { userId })
    }

    const [messages, totalCount] = await Promise.all([
      query.getMany(),
      query.getCount()
    ])

    // 计算基础统计数据
    const stats = {
      totalMessages: totalCount,
      messagesByType: this.countMessagesByType(messages),
      messagesByHour: this.countMessagesByHour(messages),
      averageResponseTime: await this.calculateAverageResponseTime(
        messages
      ),
      engagementRate: await this.calculateEngagementRate(
        messages
      ),
      topSenders: await this.getTopSenders(messages),
      popularKeywords: await this.getPopularKeywords(
        messages
      )
    }

    return stats
  }

  private countMessagesByType(messages: Message[]) {
    return messages.reduce((acc, message) => {
      acc[message.type] = (acc[message.type] || 0) + 1
      return acc
    }, {})
  }

  private countMessagesByHour(messages: Message[]) {
    const hourCounts = new Array(24).fill(0)
    messages.forEach(message => {
      const hour = new Date(message.createdAt).getHours()
      hourCounts[hour]++
    })
    return hourCounts
  }

  private async calculateAverageResponseTime(
    messages: Message[]
  ) {
    const responseTimes = []
    for (let i = 1; i < messages.length; i++) {
      const currentMessage = messages[i]
      const previousMessage = messages[i - 1]

      if (
        currentMessage.sender.id !==
        previousMessage.sender.id
      ) {
        const responseTime = moment(
          currentMessage.createdAt
        ).diff(previousMessage.createdAt, 'seconds')
        responseTimes.push(responseTime)
      }
    }

    return responseTimes.length
      ? Math.round(
          responseTimes.reduce((a, b) => a + b, 0) /
            responseTimes.length
        )
      : 0
  }

  private async calculateEngagementRate(
    messages: Message[]
  ) {
    const totalParticipants = new Set(
      messages.map(m => m.sender.id)
    ).size
    const messageCount = messages.length

    return totalParticipants
      ? messageCount / totalParticipants
      : 0
  }

  private async getTopSenders(messages: Message[]) {
    const senderCounts = messages.reduce((acc, message) => {
      const senderId = message.sender.id
      acc[senderId] = acc[senderId] || {
        id: senderId,
        name: message.sender.name,
        count: 0
      }
      acc[senderId].count++
      return acc
    }, {})

    return Object.values(senderCounts)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)
  }

  private async getPopularKeywords(messages: Message[]) {
    const result = await this.elasticsearchService.search({
      index: 'messages',
      body: {
        size: 0,
        aggs: {
          keywords: {
            significant_text: {
              field: 'content',
              size: 10
            }
          }
        }
      }
    })

    return result.aggregations.keywords.buckets.map(
      bucket => ({
        keyword: bucket.key,
        score: bucket.score,
        count: bucket.doc_count
      })
    )
  }

  async generateReport(params: {
    startDate: Date
    endDate: Date
    groupId?: string
    format?: string
  }) {
    const { startDate, endDate, groupId, format } = params

    const stats = await this.getMessageStats({
      startDate,
      endDate,
      groupId
    })

    // 获取活跃时段
    const activeHours = stats.messagesByHour
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(
        ({ hour, count }) =>
          `${hour}:00-${hour + 1}:00 (${count}条消息)`
      )

    // 生成报告内容
    const report = {
      summary: {
        totalMessages: stats.totalMessages,
        averageResponseTime: `${stats.averageResponseTime}秒`,
        engagementRate: stats.engagementRate.toFixed(2),
        activeHours
      },
      messageTypes: stats.messagesByType,
      topContributors: stats.topSenders,
      trends: {
        keywords: stats.popularKeywords,
        hourlyActivity: stats.messagesByHour
      }
    }

    // 根据格式返回不同的报告
    switch (format) {
      case 'json':
        return report
      case 'html':
        return this.generateHtmlReport(report)
      case 'pdf':
        return this.generatePdfReport(report)
      default:
        return report
    }
  }

  private generateHtmlReport(data: any) {
    // 生成HTML格式的报告
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 800px; margin: 0 auto; }
            .section { margin: 20px 0; }
            .chart { width: 100%; height: 300px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>消息分析报告</h1>
            
            <div class="section">
              <h2>概述</h2>
              <p>总消息数：${data.summary.totalMessages}</p>
              <p>平均响应时间：${data.summary.averageResponseTime}</p>
              <p>参与度：${data.summary.engagementRate}</p>
              <p>活跃时段：${data.summary.activeHours.join(
                ', '
              )}</p>
            </div>

            <div class="section">
              <h2>消息类型分布</h2>
              <div class="chart">
                ${this.generateChart(data.messageTypes)}
              </div>
            </div>

            <div class="section">
              <h2>活跃成员</h2>
              <ul>
                ${data.topContributors
                  .map(
                    (user: any) =>
                      `<li>${user.name}: ${user.count}条消息</li>`
                  )
                  .join('')}
              </ul>
            </div>

            <div class="section">
              <h2>热门关键词</h2>
              <ul>
                ${data.trends.keywords
                  .map(
                    (keyword: any) =>
                      `<li>${keyword.keyword}: ${keyword.count}次</li>`
                  )
                  .join('')}
              </ul>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateChart(data: any) {
    // 使用Chart.js生成图表
    return `
      <canvas id="chart"></canvas>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        const ctx = document.getElementById('chart');
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ${JSON.stringify(Object.keys(data))},
            datasets: [{
              data: ${JSON.stringify(Object.values(data))},
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
              ]
            }]
          }
        });
      </script>
    `
  }

  private async generatePdfReport(data: any) {
    // 使用 puppeteer 将 HTML 转换为 PDF
    const html = this.generateHtmlReport(data)
    // TODO: 实现 PDF 生成逻辑
    return html
  }

  async getMessageSentiment(messageId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId }
    })

    if (!message) {
      return null
    }

    // 调用情感分析API
    const sentiment = await this.analyzeSentiment(
      message.content
    )

    return {
      messageId,
      content: message.content,
      sentiment
    }
  }

  private async analyzeSentiment(text: string) {
    // TODO: 接入第三方情感分析API
    return {
      score: Math.random(), // 示例：返回0-1之间的分数
      label:
        Math.random() > 0.5 ? 'positive' : 'negative'
    }
  }

  async getUserInteractionAnalytics(userId: string) {
    const interactions = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.room', 'room')
      .leftJoin('room.members', 'members')
      .where('sender.id = :userId', { userId })
      .orWhere('members.id = :userId', { userId })
      .getMany()

    const analytics = {
      totalInteractions: interactions.length,
      sentMessages: interactions.filter(
        m => m.sender.id === userId
      ).length,
      receivedMessages: interactions.filter(
        m => m.sender.id !== userId
      ).length,
      interactionsByDate: this.groupInteractionsByDate(
        interactions
      ),
      commonInteractors: await this.findCommonInteractors(
        interactions,
        userId
      )
    }

    return analytics
  }

  private groupInteractionsByDate(messages: Message[]) {
    return messages.reduce((acc, message) => {
      const date = moment(message.createdAt).format(
        'YYYY-MM-DD'
      )
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  }

  private async findCommonInteractors(
    messages: Message[],
    userId: string
  ) {
    const interactors = messages.reduce((acc, message) => {
      const otherUserId =
        message.sender.id === userId
          ? message.room.members.find(
              m => m.id !== userId
            )?.id
          : message.sender.id

      if (otherUserId) {
        acc[otherUserId] = (acc[otherUserId] || 0) + 1
      }
      return acc
    }, {})

    const users = await this.userRepository.findByIds(
      Object.keys(interactors)
    )

    return users
      .map(user => ({
        user,
        interactionCount: interactors[user.id]
      }))
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, 5)
  }
}
