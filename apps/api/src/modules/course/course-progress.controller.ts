import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CourseProgressService } from './course-progress.service';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CourseProgressController {
  constructor(private readonly progressService: CourseProgressService) {}

  @Get(':courseId/progress')
  async getProgress(@Request() req, @Param('courseId') courseId: string) {
    return this.progressService.getProgress(courseId, req.user.id);
  }

  @Post(':courseId/lessons/:lessonId/complete')
  async completedLesson(
    @Request() req,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.progressService.updateLessonProgress(
      courseId,
      req.user.id,
      lessonId,
    );
  }

  @Post(':courseId/lessons/:lessonId/notes')
  async addNote(
    @Request() req,
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body('content') content: string,
  ) {
    return this.progressService.addNote(
      courseId,
      req.user.id,
      lessonId,
      content,
    );
  }

  @Post(':courseId/quizzes/:quizId/submit')
  async submitQuiz(
    @Request() req,
    @Param('courseId') courseId: string,
    @Param('quizId') quizId: string,
    @Body('score') score: number,
  ) {
    return this.progressService.submitQuiz(
      courseId,
      req.user.id,
      quizId,
      score,
    );
  }

  @Post(':courseId/assignments/:assignmentId/submit')
  async submitAssignment(
    @Request() req,
    @Param('courseId') courseId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.progressService.submitAssignment(
      courseId,
      req.user.id,
      assignmentId,
    );
  }

  @Put(':courseId/assignments/:assignmentId/grade')
  async gradeAssignment(
    @Param('courseId') courseId: string,
    @Param('assignmentId') assignmentId: string,
    @Body() data: { studentId: string; score: number },
  ) {
    return this.progressService.gradeAssignment(
      courseId,
      data.studentId,
      assignmentId,
      data.score,
    );
  }

  @Get('my-progress')
  async getStudentProgress(@Request() req) {
    return this.progressService.getStudentProgress(req.user.id);
  }

  @Get(':courseId/students-progress')
  async getCourseStudentsProgress(@Param('courseId') courseId: string) {
    return this.progressService.getCourseStudentsProgress(courseId);
  }
}
