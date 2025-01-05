import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LiveSessionService } from './live-session.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSessionDto, SessionResponse } from './dto/create-session.dto';

@ApiTags('live')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('live/sessions')
export class LiveSessionController {
  constructor(private readonly liveSessionService: LiveSessionService) {}

  @Post()
  @ApiOperation({ summary: '创建课堂会话' })
  @ApiResponse({
    status: 201,
    description: '成功创建课堂会话',
    type: SessionResponse,
  })
  async createSession(@Body() createSessionDto: CreateSessionDto, @Request() req) {
    return this.liveSessionService.createClassroom(
      createSessionDto.bookingId,
      req.user,
    );
  }

  @Post(':id/start')
  @ApiOperation({ summary: '开始课堂' })
  @ApiParam({ name: 'id', description: '会话 ID' })
  @ApiResponse({
    status: 200,
    description: '成功开始课堂',
    schema: {
      properties: {
        id: { type: 'string' },
        status: { type: 'string', example: 'active' },
        actualStartTime: { type: 'string', format: 'date-time' },
      },
    },
  })
  async startSession(@Param('id') id: string, @Request() req) {
    return this.liveSessionService.startSession(id, req.user);
  }

  @Post(':id/end')
  @ApiOperation({ summary: '结束课堂' })
  @ApiParam({ name: 'id', description: '会话 ID' })
  @ApiResponse({
    status: 200,
    description: '成功结束课堂',
    schema: {
      properties: {
        id: { type: 'string' },
        status: { type: 'string', example: 'completed' },
        actualEndTime: { type: 'string', format: 'date-time' },
      },
    },
  })
  async endSession(@Param('id') id: string, @Request() req) {
    return this.liveSessionService.endSession(id, req.user);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: '获取参与者列表' })
  @ApiParam({ name: 'id', description: '会话 ID' })
  @ApiResponse({
    status: 200,
    description: '成功获取参与者列表',
    schema: {
      properties: {
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string', enum: ['tutor', 'student'] },
              isAudioEnabled: { type: 'boolean' },
              isVideoEnabled: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  async getParticipants(@Param('id') id: string) {
    return this.liveSessionService.getParticipants(id);
  }
}
