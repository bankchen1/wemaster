import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseProgress } from './course-progress.entity';
import { Course } from './course.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private readonly progressRepository: Repository<CourseProgress>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async getProgress(courseId: string, studentId: string): Promise<CourseProgress> {
    const progress = await this.progressRepository.findOne({
      where: {
        course: { id: courseId },
        student: { id: studentId },
      },
      relations: ['course', 'student'],
    });

    if (!progress) {
      throw new NotFoundException('Course progress not found');
    }

    return progress;
  }

  async updateLessonProgress(
    courseId: string,
    studentId: string,
    lessonId: string,
  ): Promise<CourseProgress> {
    const progress = await this.getProgress(courseId, studentId);

    // Update completed lessons
    if (!progress.progress.completedTopics.includes(lessonId)) {
      progress.progress.completedTopics.push(lessonId);
      progress.progress.completedLessons += 1;
      progress.progress.lastAccessedAt = new Date();
    }

    // Update completion percentage
    progress.completionPercentage =
      (progress.progress.completedLessons / progress.progress.totalLessons) * 100;

    // Check if course is completed
    if (progress.completionPercentage === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    return this.progressRepository.save(progress);
  }

  async addNote(
    courseId: string,
    studentId: string,
    lessonId: string,
    content: string,
  ): Promise<CourseProgress> {
    const progress = await this.getProgress(courseId, studentId);

    progress.notes.push({
      lessonId,
      content,
      createdAt: new Date(),
    });

    return this.progressRepository.save(progress);
  }

  async submitQuiz(
    courseId: string,
    studentId: string,
    quizId: string,
    score: number,
  ): Promise<CourseProgress> {
    const progress = await this.getProgress(courseId, studentId);

    progress.progress.quizScores.push({
      quizId,
      score,
      completedAt: new Date(),
    });

    return this.progressRepository.save(progress);
  }

  async submitAssignment(
    courseId: string,
    studentId: string,
    assignmentId: string,
  ): Promise<CourseProgress> {
    const progress = await this.getProgress(courseId, studentId);

    const assignmentIndex = progress.progress.assignments.findIndex(
      a => a.assignmentId === assignmentId,
    );

    if (assignmentIndex === -1) {
      progress.progress.assignments.push({
        assignmentId,
        status: 'submitted',
        submittedAt: new Date(),
      });
    } else {
      progress.progress.assignments[assignmentIndex] = {
        ...progress.progress.assignments[assignmentIndex],
        status: 'submitted',
        submittedAt: new Date(),
      };
    }

    return this.progressRepository.save(progress);
  }

  async gradeAssignment(
    courseId: string,
    studentId: string,
    assignmentId: string,
    score: number,
  ): Promise<CourseProgress> {
    const progress = await this.getProgress(courseId, studentId);

    const assignmentIndex = progress.progress.assignments.findIndex(
      a => a.assignmentId === assignmentId,
    );

    if (assignmentIndex === -1) {
      throw new NotFoundException('Assignment not found');
    }

    progress.progress.assignments[assignmentIndex] = {
      ...progress.progress.assignments[assignmentIndex],
      status: 'graded',
      score,
      gradedAt: new Date(),
    };

    return this.progressRepository.save(progress);
  }

  async awardAchievement(
    courseId: string,
    studentId: string,
    achievement: {
      type: string;
      title: string;
      description: string;
    },
  ): Promise<CourseProgress> {
    const progress = await this.getProgress(courseId, studentId);

    progress.achievements.push({
      ...achievement,
      earnedAt: new Date(),
    });

    return this.progressRepository.save(progress);
  }

  async getStudentProgress(studentId: string): Promise<CourseProgress[]> {
    return this.progressRepository.find({
      where: {
        student: { id: studentId },
      },
      relations: ['course'],
    });
  }

  async getCourseStudentsProgress(courseId: string): Promise<CourseProgress[]> {
    return this.progressRepository.find({
      where: {
        course: { id: courseId },
      },
      relations: ['student'],
    });
  }
}
