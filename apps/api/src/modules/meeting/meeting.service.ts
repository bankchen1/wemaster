import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { jitsiConfig } from '../../config/jitsi.config';
import { createClient } from 'matrix-js-sdk';
import { matrixConfig } from '../../config/matrix.config';
import { RedisCacheService } from '../cache/redis-cache.service';

@Injectable()
export class MeetingService {
  private matrixClient;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cacheService: RedisCacheService,
  ) {
    this.initMatrixClient();
  }

  private async initMatrixClient() {
    this.matrixClient = createClient({
      baseUrl: matrixConfig.homeserverUrl,
      accessToken: matrixConfig.accessToken,
    });
    await this.matrixClient.startClient({ initialSyncLimit: 10 });
  }

  // 创建会议
  async createMeeting(userId: string, meetingData: any) {
    try {
      // 生成会议ID
      const meetingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 创建 JWT token 用于 Jitsi 认证
      const token = this.jwtService.sign(
        {
          sub: userId,
          room: meetingId,
          iss: jitsiConfig.appId,
        },
        {
          secret: jitsiConfig.appSecret,
          expiresIn: jitsiConfig.jwt.expiresIn,
          algorithm: jitsiConfig.jwt.algorithm as any,
        }
      );

      // 创建 Matrix 房间用于聊天
      const room = await this.matrixClient.createRoom({
        visibility: matrixConfig.room.defaultVisibility,
        preset: 'private_chat',
        initial_state: [
          {
            type: 'm.room.encryption',
            state_key: '',
            content: {
              algorithm: 'm.megolm.v1.aes-sha2',
            },
          },
        ],
      });

      // 保存会议信息到数据库
      const meeting = await this.prisma.meeting.create({
        data: {
          id: meetingId,
          hostId: userId,
          matrixRoomId: room.room_id,
          status: 'scheduled',
          ...meetingData,
        },
      });

      // 缓存会议信息
      await this.cacheService.set(
        `meeting:${meetingId}`,
        {
          ...meeting,
          token,
        },
        3600 // 1小时过期
      );

      return {
        meetingId,
        token,
        matrixRoomId: room.room_id,
      };
    } catch (error) {
      // 错误处理和重试机制
      if (error.name === 'MatrixError') {
        // 重试 Matrix 操作
        return await this.retryMatrixOperation(() =>
          this.createMeeting(userId, meetingData)
        );
      }
      throw error;
    }
  }

  // 加入会议
  async joinMeeting(userId: string, meetingId: string) {
    try {
      // 检查会议是否存在
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // 检查用户权限
      const canJoin = await this.checkMeetingAccess(userId, meetingId);
      if (!canJoin) {
        throw new Error('Access denied');
      }

      // 生成参会者 token
      const token = this.jwtService.sign(
        {
          sub: userId,
          room: meetingId,
          iss: jitsiConfig.appId,
          role: 'participant',
        },
        {
          secret: jitsiConfig.appSecret,
          expiresIn: jitsiConfig.jwt.expiresIn,
          algorithm: jitsiConfig.jwt.algorithm as any,
        }
      );

      // 加入 Matrix 房间
      await this.matrixClient.joinRoom(meeting.matrixRoomId);

      // 记录参会记录
      await this.prisma.meetingParticipant.create({
        data: {
          meetingId,
          userId,
          joinTime: new Date(),
        },
      });

      return {
        token,
        matrixRoomId: meeting.matrixRoomId,
      };
    } catch (error) {
      if (error.name === 'MatrixError') {
        return await this.retryMatrixOperation(() =>
          this.joinMeeting(userId, meetingId)
        );
      }
      throw error;
    }
  }

  // 结束会议
  async endMeeting(userId: string, meetingId: string) {
    try {
      const meeting = await this.prisma.meeting.findUnique({
        where: { id: meetingId },
      });

      if (!meeting || meeting.hostId !== userId) {
        throw new Error('Unauthorized');
      }

      // 更新会议状态
      await this.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'ended', endTime: new Date() },
      });

      // 关闭 Matrix 房间
      await this.matrixClient.sendStateEvent(
        meeting.matrixRoomId,
        'm.room.power_levels',
        {
          events_default: 100, // 禁止普通用户发送消息
        },
        ''
      );

      // 清理缓存
      await this.cacheService.del(`meeting:${meetingId}`);

      return { success: true };
    } catch (error) {
      if (error.name === 'MatrixError') {
        return await this.retryMatrixOperation(() =>
          this.endMeeting(userId, meetingId)
        );
      }
      throw error;
    }
  }

  // 消息持久化
  async saveMeetingMessage(meetingId: string, message: any) {
    await this.prisma.meetingMessage.create({
      data: {
        meetingId,
        senderId: message.sender,
        content: message.content,
        type: message.type,
        timestamp: new Date(message.timestamp),
      },
    });
  }

  // Matrix 操作重试机制
  private async retryMatrixOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
    throw lastError;
  }

  // 检查会议访问权限
  private async checkMeetingAccess(userId: string, meetingId: string): Promise<boolean> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        participants: true,
      },
    });

    if (!meeting) return false;

    // 检查是否是主持人
    if (meeting.hostId === userId) return true;

    // 检查是否在参会者列表中
    return meeting.participants.some(p => p.userId === userId);
  }
}
