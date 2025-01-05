import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { File, FileAccessLevel, FileCategory } from './file.entity';
import { FileShare } from './file-share.entity';
import { User } from '../user/user.entity';

@Injectable()
export class StorageService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: string[];

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(FileShare)
    private readonly fileShareRepository: Repository<FileShare>,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    this.maxFileSize = this.configService.get<number>('MAX_FILE_SIZE', 100 * 1024 * 1024); // 100MB
    this.allowedMimeTypes = this.configService.get<string[]>('ALLOWED_MIME_TYPES', [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'audio/mpeg',
    ]);
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    options: {
      courseId?: string;
      category?: FileCategory;
      accessLevel?: FileAccessLevel;
      description?: string;
      tags?: string[];
      expiresAt?: Date;
    } = {},
  ): Promise<File> {
    // Validate file
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds the limit');
    }
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    // Generate unique filename
    const extension = path.extname(file.originalname);
    const filename = `${crypto.randomBytes(16).toString('hex')}${extension}`;
    const relativePath = path.join(
      options.courseId || userId,
      options.category || FileCategory.OTHER,
      filename,
    );
    const fullPath = path.join(this.uploadDir, relativePath);

    // Create directory if not exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Move file
    await fs.writeFile(fullPath, file.buffer);

    // Create file record
    const fileEntity = this.fileRepository.create({
      name: filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      extension,
      size: file.size,
      path: relativePath,
      userId,
      courseId: options.courseId,
      category: options.category || FileCategory.OTHER,
      accessLevel: options.accessLevel || FileAccessLevel.PRIVATE,
      description: options.description,
      tags: options.tags || [],
      expiresAt: options.expiresAt,
    });

    return this.fileRepository.save(fileEntity);
  }

  async getFile(fileId: string, userId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId },
      relations: ['user'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.accessLevel === FileAccessLevel.PRIVATE && file.userId !== userId) {
      const share = await this.fileShareRepository.findOne({
        where: { fileId, userId },
      });
      if (!share) {
        throw new UnauthorizedException('You do not have access to this file');
      }
    }

    return file;
  }

  async downloadFile(fileId: string, userId: string): Promise<{ path: string; filename: string }> {
    const file = await this.getFile(fileId, userId);
    
    // Update download count
    await this.fileRepository.update(fileId, {
      downloads: () => 'downloads + 1',
    });

    return {
      path: path.join(this.uploadDir, file.path),
      filename: file.originalName,
    };
  }

  async shareFile(
    fileId: string,
    sharedByUserId: string,
    sharedWithUserId: string,
    permission: string = 'view',
    expiresAt?: Date,
  ): Promise<FileShare> {
    const file = await this.getFile(fileId, sharedByUserId);

    if (file.userId !== sharedByUserId) {
      throw new UnauthorizedException('You do not have permission to share this file');
    }

    const share = this.fileShareRepository.create({
      fileId,
      userId: sharedWithUserId,
      sharedByUserId,
      permission,
      expiresAt,
    });

    return this.fileShareRepository.save(share);
  }

  async generateTemporaryLink(
    fileId: string,
    userId: string,
    expiresIn: number = 3600, // 1 hour
  ): Promise<string> {
    const file = await this.getFile(fileId, userId);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.fileShareRepository.save({
      fileId,
      userId,
      sharedByUserId: userId,
      permission: 'view',
      expiresAt,
      id: token,
    });

    return token;
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.getFile(fileId, userId);

    if (file.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to delete this file');
    }

    // Delete physical file
    try {
      await fs.unlink(path.join(this.uploadDir, file.path));
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete shares
    await this.fileShareRepository.delete({ fileId });

    // Delete file record
    await this.fileRepository.delete(fileId);
  }

  async archiveFile(fileId: string, userId: string): Promise<File> {
    const file = await this.getFile(fileId, userId);

    if (file.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to archive this file');
    }

    file.isArchived = true;
    return this.fileRepository.save(file);
  }

  async getUserFiles(
    userId: string,
    options: {
      category?: FileCategory;
      courseId?: string;
      archived?: boolean;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<[File[], number]> {
    const query = this.fileRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', { userId });

    if (options.category) {
      query.andWhere('file.category = :category', { category: options.category });
    }

    if (options.courseId) {
      query.andWhere('file.courseId = :courseId', { courseId: options.courseId });
    }

    if (typeof options.archived === 'boolean') {
      query.andWhere('file.isArchived = :archived', { archived: options.archived });
    }

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    return query.getManyAndCount();
  }

  async getSharedFiles(
    userId: string,
    options: {
      page?: number;
      limit?: number;
    } = {},
  ): Promise<[FileShare[], number]> {
    const query = this.fileShareRepository
      .createQueryBuilder('share')
      .leftJoinAndSelect('share.file', 'file')
      .leftJoinAndSelect('share.sharedByUser', 'sharedByUser')
      .where('share.userId = :userId', { userId })
      .andWhere('share.expiresAt IS NULL OR share.expiresAt > :now', {
        now: new Date(),
      });

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    return query.getManyAndCount();
  }
}
