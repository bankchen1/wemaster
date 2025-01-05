import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { Course } from '../course/course.entity'
import { Tutor } from '../tutor/tutor.entity'

@Entity('subjects')
@Tree("materialized-path")
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 100 })
  nameZh: string // 中文名称

  @Column({ type: 'varchar', length: 100 })
  nameJa: string // 日文名称

  @Column({ type: 'varchar', length: 100 })
  nameKo: string // 韩文名称

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string // 科目编码，如 "MATH-101"

  @Column({ type: 'int', default: 0 })
  level: number // 层级：1=一级科目，2=二级科目，3=三级科目

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string // 图标URL

  @TreeChildren()
  children: Subject[]

  @TreeParent()
  parent: Subject

  @ManyToMany(() => Course)
  @JoinTable({
    name: 'subject_courses',
    joinColumn: { name: 'subjectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'courseId', referencedColumnName: 'id' }
  })
  courses: Course[]

  @ManyToMany(() => Tutor)
  @JoinTable({
    name: 'subject_tutors',
    joinColumn: { name: 'subjectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tutorId', referencedColumnName: 'id' }
  })
  tutors: Tutor[]

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
