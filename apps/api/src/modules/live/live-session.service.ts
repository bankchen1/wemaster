import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { LiveKit, RoomServiceClient, AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LiveSessionService {
  private readonly logger = new Logger(LiveSessionService.name);
  private readonly roomService: RoomServiceClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    // 初始化 LiveKit 客户端
    this.roomService = new RoomServiceClient(
      this.configService.get('LIVEKIT_API_URL'),
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET')
    );
  }

  // 创建课程房间
  async createClassroom(bookingId: string) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          tutor: true,
          student: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // 创建房间
      const room = await this.roomService.createRoom({
        name: `class_${bookingId}`,
        emptyTimeout: 60 * 60, // 1小时后自动关闭
        maxParticipants: 2, // 仅允许导师和学生
      });

      // 创建课程记录
      const session = await this.prisma.liveSession.create({
        data: {
          bookingId,
          roomName: room.name,
          status: 'created',
          startTime: booking.startTime,
          endTime: booking.endTime,
          tutorId: booking.tutorId,
          studentId: booking.studentId,
        },
      });

      // 生成访问令牌
      const tutorToken = this.generateToken(room.name, booking.tutorId, 'tutor');
      const studentToken = this.generateToken(room.name, booking.studentId, 'student');

      // 发送通知
      await this.notificationService.sendToUser(booking.tutorId, {
        type: 'CLASS_CREATED',
        title: '课程房间已创建',
        message: `您的课程将于 ${booking.startTime} 开始`,
      });

      await this.notificationService.sendToUser(booking.studentId, {
        type: 'CLASS_CREATED',
        title: '课程房间已创建',
        message: `您的课程将于 ${booking.startTime} 开始`,
      });

      return {
        session,
        tutorToken,
        studentToken,
      };
    } catch (error) {
      this.logger.error('Failed to create classroom', error);
      throw error;
    }
  }

  // 生成访问令牌
  private generateToken(roomName: string, userId: string, role: 'tutor' | 'student') {
    const at = new AccessToken(
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET'),
      {
        identity: userId,
        name: userId,
      }
    );

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // 导师特权
    if (role === 'tutor') {
      at.addGrant({
        roomAdmin: true,
        recorder: true,
      });
    }

    return at.toJwt();
  }

  // 开始课程
  async startSession(sessionId: string) {
    try {
      const session = await this.prisma.liveSession.update({
        where: { id: sessionId },
        data: {
          status: 'active',
          actualStartTime: new Date(),
        },
        include: {
          booking: {
            include: {
              tutor: true,
              student: true,
            },
          },
        },
      });

      // 发送通知
      await this.notificationService.sendToUser(session.tutorId, {
        type: 'CLASS_STARTED',
        title: '课程已开始',
        message: '课程已开始，请准时上课',
      });

      await this.notificationService.sendToUser(session.studentId, {
        type: 'CLASS_STARTED',
        title: '课程已开始',
        message: '课程已开始，请准时上课',
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to start session', error);
      throw error;
    }
  }

  // 结束课程
  async endSession(sessionId: string) {
    try {
      const session = await this.prisma.liveSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          actualEndTime: new Date(),
        },
        include: {
          booking: {
            include: {
              tutor: true,
              student: true,
            },
          },
        },
      });

      // 关闭房间
      await this.roomService.deleteRoom(session.roomName);

      // 发送通知
      await this.notificationService.sendToUser(session.tutorId, {
        type: 'CLASS_ENDED',
        title: '课程已结束',
        message: '课程已结束，请及时提交课程总结',
      });

      await this.notificationService.sendToUser(session.studentId, {
        type: 'CLASS_ENDED',
        title: '课程已结束',
        message: '课程已结束，请对本次课程进行评价',
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to end session', error);
      throw error;
    }
  }

  // 记录课程事件
  async logSessionEvent(sessionId: string, event: {
    type: 'chat' | 'whiteboard' | 'screen_share' | 'hand_raise';
    action: string;
    userId: string;
    metadata?: any;
  }) {
    try {
      await this.prisma.sessionEvent.create({
        data: {
          sessionId,
          type: event.type,
          action: event.action,
          userId: event.userId,
          metadata: event.metadata,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log session event', error);
      throw error;
    }
  }

  // 获取课程统计
  async getSessionStats(sessionId: string) {
    try {
      const session = await this.prisma.liveSession.findUnique({
        where: { id: sessionId },
        include: {
          events: true,
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const duration = session.actualEndTime
        ? Math.floor(
            (session.actualEndTime.getTime() - session.actualStartTime.getTime()) /
              1000 /
              60
          )
        : 0;

      const events = session.events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {});

      return {
        duration,
        events,
        startTime: session.actualStartTime,
        endTime: session.actualEndTime,
        status: session.status,
      };
    } catch (error) {
      this.logger.error('Failed to get session stats', error);
      throw error;
    }
  }

  // 获取课程信息
  async getSession(sessionId: string) {
    try {
      const session = await this.prisma.liveSession.findUnique({
        where: { id: sessionId },
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          booking: true,
        },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      return session;
    } catch (error) {
      this.logger.error('Failed to get session', error);
      throw error;
    }
  }

  // 开始录制
  async startRecording(sessionId: string) {
    try {
      const session = await this.getSession(sessionId);
      
      // 开始录制
      await this.roomService.startRecording(session.roomName, {
        output: {
          fileType: 'mp4',
          filepath: `recordings/${session.roomName}/${new Date().toISOString()}.mp4`,
        },
      });

      // 记录事件
      await this.logSessionEvent(sessionId, {
        type: 'recording',
        action: 'started',
        userId: session.tutorId,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to start recording', error);
      throw error;
    }
  }

  // 停止录制
  async stopRecording(sessionId: string) {
    try {
      const session = await this.getSession(sessionId);
      
      // 停止录制
      const recording = await this.roomService.stopRecording(session.roomName);

      // 更新课程记录
      await this.prisma.liveSession.update({
        where: { id: sessionId },
        data: {
          recordingUrl: recording.url,
        },
      });

      // 记录事件
      await this.logSessionEvent(sessionId, {
        type: 'recording',
        action: 'stopped',
        userId: session.tutorId,
        metadata: { url: recording.url },
      });

      return recording.url;
    } catch (error) {
      this.logger.error('Failed to stop recording', error);
      throw error;
    }
  }

  // 获取参与者列表
  async getParticipants(sessionId: string) {
    try {
      const session = await this.getSession(sessionId);
      const participants = await this.roomService.listParticipants(session.roomName);

      return participants.map(p => ({
        id: p.identity,
        name: p.name,
        role: p.identity === session.tutorId ? 'tutor' : 'student',
        metadata: p.metadata,
        joinedAt: p.joinedAt,
        state: p.state,
        tracks: p.tracks,
      }));
    } catch (error) {
      this.logger.error('Failed to get participants', error);
      throw error;
    }
  }

  // 移除参与者
  async removeParticipant(sessionId: string, participantId: string) {
    try {
      const session = await this.getSession(sessionId);
      await this.roomService.removeParticipant(session.roomName, participantId);

      // 记录事件
      await this.logSessionEvent(sessionId, {
        type: 'participant',
        action: 'removed',
        userId: participantId,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to remove participant', error);
      throw error;
    }
  }

  // 禁用/启用参与者音频
  async muteParticipant(sessionId: string, participantId: string, mute: boolean) {
    try {
      const session = await this.getSession(sessionId);
      await this.roomService.muteTrack(session.roomName, participantId, 'audio', mute);

      // 记录事件
      await this.logSessionEvent(sessionId, {
        type: 'participant',
        action: mute ? 'muted' : 'unmuted',
        userId: participantId,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to mute participant', error);
      throw error;
    }
  }
}
