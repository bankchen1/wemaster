import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { LiveClass } from './entities/live-class.entity';
import { WhiteWebSdk } from 'white-web-sdk';

@Injectable()
export class LiveClassService {
  constructor(
    @InjectRepository(LiveClass)
    private readonly liveClassRepository: Repository<LiveClass>,
  ) {}

  async createLiveClass(data: any) {
    const liveClass = this.liveClassRepository.create({
      ...data,
      status: 'scheduled',
    });

    // 创建白板房间
    const whiteboardInfo = await this.createWhiteboardRoom();
    liveClass.whiteboardRoomUUID = whiteboardInfo.roomUUID;

    return this.liveClassRepository.save(liveClass);
  }

  async getLiveClasses(query: any) {
    const queryBuilder = this.liveClassRepository.createQueryBuilder('liveClass');

    if (query.status) {
      queryBuilder.andWhere('liveClass.status = :status', {
        status: query.status,
      });
    }

    if (query.hostId) {
      queryBuilder.andWhere('liveClass.hostId = :hostId', {
        hostId: query.hostId,
      });
    }

    return queryBuilder
      .leftJoinAndSelect('liveClass.host', 'host')
      .leftJoinAndSelect('liveClass.participants', 'participants')
      .orderBy('liveClass.scheduledStartTime', 'DESC')
      .getMany();
  }

  async getLiveClass(id: string) {
    const liveClass = await this.liveClassRepository.findOne({
      where: { id },
      relations: ['host', 'participants'],
    });

    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    return liveClass;
  }

  async generateToken(classId: string, userId: string) {
    const liveClass = await this.getLiveClass(classId);

    // 生成Agora Token
    const appID = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = classId;
    const uid = userId;
    const role = liveClass.hostId === userId ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs,
    );

    return {
      token,
      channel: channelName,
      uid,
      role,
    };
  }

  async getWhiteboardInfo(classId: string) {
    const liveClass = await this.getLiveClass(classId);

    // 生成白板Token
    const whiteboardToken = await this.generateWhiteboardToken(
      liveClass.whiteboardRoomUUID,
    );

    return {
      roomToken: whiteboardToken,
      roomUUID: liveClass.whiteboardRoomUUID,
    };
  }

  private async createWhiteboardRoom() {
    const sdkToken = process.env.WHITEBOARD_SDK_TOKEN;
    const sdk = new WhiteWebSdk({
      appIdentifier: process.env.WHITEBOARD_APP_ID,
    });

    const room = await sdk.createRoom({
      name: 'Live Class Room',
      limit: 100,
    }, sdkToken);

    return {
      roomUUID: room.uuid,
      roomToken: room.roomToken,
    };
  }

  private async generateWhiteboardToken(roomUUID: string) {
    const sdkToken = process.env.WHITEBOARD_SDK_TOKEN;
    const sdk = new WhiteWebSdk({
      appIdentifier: process.env.WHITEBOARD_APP_ID,
    });

    return sdk.roomToken({
      uuid: roomUUID,
      role: 'writer',
    });
  }

  async startClass(classId: string, userId: string) {
    const liveClass = await this.getLiveClass(classId);

    if (liveClass.hostId !== userId) {
      throw new UnauthorizedException('Only host can start the class');
    }

    liveClass.status = 'live';
    liveClass.startTime = new Date();

    return this.liveClassRepository.save(liveClass);
  }

  async endClass(classId: string, userId: string) {
    const liveClass = await this.getLiveClass(classId);

    if (liveClass.hostId !== userId) {
      throw new UnauthorizedException('Only host can end the class');
    }

    liveClass.status = 'ended';
    liveClass.endTime = new Date();

    return this.liveClassRepository.save(liveClass);
  }

  async joinClass(classId: string, userId: string) {
    const liveClass = await this.getLiveClass(classId);

    if (!liveClass.participants) {
      liveClass.participants = [];
    }

    if (!liveClass.participants.find(p => p.id === userId)) {
      liveClass.participants.push({ id: userId });
    }

    return this.liveClassRepository.save(liveClass);
  }

  async leaveClass(classId: string, userId: string) {
    const liveClass = await this.getLiveClass(classId);

    if (liveClass.participants) {
      liveClass.participants = liveClass.participants.filter(
        p => p.id !== userId,
      );
    }

    return this.liveClassRepository.save(liveClass);
  }
}
