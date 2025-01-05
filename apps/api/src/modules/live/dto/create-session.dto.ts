import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    description: '课程预约 ID',
    example: 'booking-123',
  })
  @IsString()
  @IsNotEmpty()
  bookingId: string;
}

export class SessionResponse {
  @ApiProperty({
    description: '会话信息',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'session-123' },
      roomName: { type: 'string', example: 'class_booking-123' },
      status: { type: 'string', example: 'created' },
      tutorId: { type: 'string', example: 'tutor-123' },
      studentId: { type: 'string', example: 'student-123' },
    },
  })
  session: any;

  @ApiProperty({
    description: '导师 Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  tutorToken: string;

  @ApiProperty({
    description: '学生 Token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  studentToken: string;
}
