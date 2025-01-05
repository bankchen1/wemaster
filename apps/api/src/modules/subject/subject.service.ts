import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, TreeRepository } from 'typeorm'
import { Subject } from './subject.entity'
import { RedisService } from '../redis/redis.service'
import { LoggerService } from '../logger/logger.service'
import { subjectData } from './subject.data'

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: TreeRepository<Subject>,
    private redisService: RedisService,
    private loggerService: LoggerService
  ) {}

  async initializeSubjects(): Promise<void> {
    const existingSubjects = await this.subjectRepository.findOne({
      where: { level: 1 }
    })

    if (!existingSubjects) {
      // 初始化一级科目
      for (const mainSubject of subjectData) {
        const level1 = this.subjectRepository.create({
          name: mainSubject.name,
          nameZh: mainSubject.nameZh,
          nameJa: mainSubject.nameJa,
          nameKo: mainSubject.nameKo,
          code: mainSubject.code,
          level: 1,
          description: mainSubject.description
        })

        const savedLevel1 = await this.subjectRepository.save(level1)

        // 初始化二级科目
        if (mainSubject.children) {
          for (const subSubject of mainSubject.children) {
            const level2 = this.subjectRepository.create({
              name: subSubject.name,
              nameZh: subSubject.nameZh,
              nameJa: subSubject.nameJa,
              nameKo: subSubject.nameKo,
              code: subSubject.code,
              level: 2,
              description: subSubject.description,
              parent: savedLevel1
            })

            const savedLevel2 = await this.subjectRepository.save(level2)

            // 初始化三级科目
            if (subSubject.children) {
              for (const detail of subSubject.children) {
                const level3 = this.subjectRepository.create({
                  name: detail.name,
                  nameZh: detail.nameZh,
                  nameJa: detail.nameJa,
                  nameKo: detail.nameKo,
                  code: detail.code,
                  level: 3,
                  description: detail.description,
                  parent: savedLevel2
                })

                await this.subjectRepository.save(level3)
              }
            }
          }
        }
      }
    }
  }

  async getSubjectTree(): Promise<Subject[]> {
    // 尝试从缓存获取
    const cached = await this.redisService.get('subject:tree')
    if (cached) {
      return JSON.parse(cached)
    }

    // 从数据库获取
    const tree = await this.subjectRepository.findTrees()

    // 设置缓存
    await this.redisService.set(
      'subject:tree',
      JSON.stringify(tree),
      60 * 60 // 1小时缓存
    )

    return tree
  }

  async searchSubjects(query: string, language: string = 'en'): Promise<Subject[]> {
    const queryBuilder = this.subjectRepository.createQueryBuilder('subject')

    // 根据语言选择搜索字段
    let nameField = 'name'
    switch (language) {
      case 'zh':
        nameField = 'nameZh'
        break
      case 'ja':
        nameField = 'nameJa'
        break
      case 'ko':
        nameField = 'nameKo'
        break
    }

    return queryBuilder
      .where(`subject.${nameField} ILIKE :query`, { query: `%${query}%` })
      .orWhere('subject.code ILIKE :query', { query: `%${query}%` })
      .orWhere('subject.description ILIKE :query', { query: `%${query}%` })
      .getMany()
  }

  async getSubjectsByLevel(level: number): Promise<Subject[]> {
    return this.subjectRepository.find({
      where: { level }
    })
  }

  async getSubjectById(id: string): Promise<Subject> {
    return this.subjectRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    })
  }

  async getSubjectPath(id: string): Promise<Subject[]> {
    const subject = await this.subjectRepository.findOne({
      where: { id }
    })

    if (!subject) {
      return []
    }

    return this.subjectRepository.findAncestors(subject)
  }

  async getPopularSubjects(): Promise<Subject[]> {
    const queryBuilder = this.subjectRepository.createQueryBuilder('subject')
      .leftJoin('subject.courses', 'course')
      .leftJoin('subject.tutors', 'tutor')
      .select([
        'subject',
        'COUNT(DISTINCT course.id) as courseCount',
        'COUNT(DISTINCT tutor.id) as tutorCount'
      ])
      .groupBy('subject.id')
      .orderBy('courseCount', 'DESC')
      .addOrderBy('tutorCount', 'DESC')
      .limit(10)

    return queryBuilder.getMany()
  }

  async getRelatedSubjects(subjectId: string): Promise<Subject[]> {
    const subject = await this.getSubjectById(subjectId)
    if (!subject) {
      return []
    }

    // 获取同级科目
    return this.subjectRepository.find({
      where: {
        level: subject.level,
        parent: subject.parent
      }
    })
  }
}
