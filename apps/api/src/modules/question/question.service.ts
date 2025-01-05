import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Question, QuestionReply } from './question.entity'
import { NotificationService } from '../notification/notification.service'
import { MarketingAutomationService } from '../marketing/marketing-automation.service'

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(QuestionReply)
    private replyRepo: Repository<QuestionReply>,
    private notificationService: NotificationService,
    private marketingService: MarketingAutomationService
  ) {}

  // 创建问题
  async createQuestion(data: {
    title: string
    content: string
    type: string
    studentId: string
    tutorId: string
  }) {
    const question = this.questionRepo.create(data)
    await this.questionRepo.save(question)

    // 发送通知给导师
    await this.notificationService.sendNotification({
      userId: data.tutorId,
      type: 'QUESTION_RECEIVED',
      title: '收到新的问题',
      message: `学生向您提问：${data.title}`,
      data: { questionId: question.id }
    })

    // 触发营销自动化
    await this.marketingService.handleUserEvent(
      'question.created',
      data.studentId,
      { questionId: question.id }
    )

    return question
  }

  // 回复问题
  async replyQuestion(data: {
    questionId: string
    userId: string
    content: string
  }) {
    const question = await this.questionRepo.findOne({
      where: { id: data.questionId },
      relations: ['student', 'tutor']
    })

    if (!question) {
      throw new Error('Question not found')
    }

    const reply = this.replyRepo.create({
      content: data.content,
      questionId: data.questionId,
      userId: data.userId
    })

    await this.replyRepo.save(reply)

    // 更新问题状态
    await this.questionRepo.update(data.questionId, {
      status: 'answered'
    })

    // 发送通知给提问者
    const notifyUserId =
      data.userId === question.tutorId
        ? question.studentId
        : question.tutorId

    await this.notificationService.sendNotification({
      userId: notifyUserId,
      type: 'QUESTION_REPLIED',
      title: '您的问题有新回复',
      message: '点击查看详情',
      data: {
        questionId: data.questionId,
        replyId: reply.id
      }
    })

    return reply
  }

  // 获取问题详情
  async getQuestion(id: string) {
    return await this.questionRepo.findOne({
      where: { id },
      relations: ['student', 'tutor', 'replies', 'replies.user']
    })
  }

  // 获取用户的问题列表
  async getUserQuestions(userId: string, role: 'student' | 'tutor') {
    const where = role === 'student' ? { studentId: userId } : { tutorId: userId }

    return await this.questionRepo.find({
      where,
      relations: ['student', 'tutor', 'replies'],
      order: {
        createdAt: 'DESC'
      }
    })
  }

  // 关闭问题
  async closeQuestion(id: string) {
    await this.questionRepo.update(id, {
      status: 'closed'
    })

    const question = await this.getQuestion(id)

    // 发送通知
    await this.notificationService.sendNotification({
      userId: question.studentId,
      type: 'QUESTION_CLOSED',
      title: '问题已关闭',
      message: '您的问题已被关闭',
      data: { questionId: id }
    })

    return question
  }

  // 获取问题模板
  async getQuestionTemplates() {
    return [
      {
        id: 'course_inquiry',
        title: '课程咨询',
        content:
          '您好，我想了解一下{subject}课程的具体内容和安排...',
        type: 'inquiry'
      },
      {
        id: 'price_inquiry',
        title: '价格咨询',
        content:
          '您好，我想了解一下您的课程价格和付款方式...',
        type: 'inquiry'
      },
      {
        id: 'schedule_inquiry',
        title: '时间咨询',
        content:
          '您好，我想确认一下您最近的授课时间安排...',
        type: 'inquiry'
      },
      {
        id: 'teaching_method',
        title: '教学方法',
        content:
          '您好，我想了解一下您的教学方法和特点...',
        type: 'inquiry'
      }
    ]
  }

  // 获取问题统计
  async getQuestionStats(userId: string, role: 'student' | 'tutor') {
    const where = role === 'student' ? { studentId: userId } : { tutorId: userId }

    const questions = await this.questionRepo.find({
      where,
      relations: ['replies']
    })

    return {
      total: questions.length,
      pending: questions.filter(q => q.status === 'pending').length,
      answered: questions.filter(q => q.status === 'answered')
        .length,
      closed: questions.filter(q => q.status === 'closed').length,
      averageResponseTime: this.calculateAverageResponseTime(
        questions
      )
    }
  }

  private calculateAverageResponseTime(questions: Question[]) {
    const responseTimes = questions
      .filter(q => q.replies && q.replies.length > 0)
      .map(q => {
        const firstReply = q.replies[0]
        return (
          firstReply.createdAt.getTime() -
          q.createdAt.getTime()
        )
      })

    if (responseTimes.length === 0) return 0

    return (
      responseTimes.reduce((a, b) => a + b, 0) /
      responseTimes.length
    )
  }
}
