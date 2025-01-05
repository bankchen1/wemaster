import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { RedisService } from '../redis/redis.service';
import { LoggerService } from '../logger/logger.service';
import * as crypto from 'crypto';
import * as mime from 'mime-types';

@Injectable()
export class SpacesService {
  private s3: S3;
  private readonly bucket: string;
  private readonly cdnDomain: string;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private loggerService: LoggerService,
  ) {
    this.s3 = new S3({
      endpoint: 'https://wemaster.nyc3.digitaloceanspaces.com',
      region: 'nyc3',
      credentials: {
        accessKeyId: 'DO00FKXKMEW887ZXPNRR',
        secretAccessKey: 'QEJ2uALNlUHTDxxvJWKEW7e7MPWyic3zZ5NrDUxWcKg',
      },
    });

    this.bucket = 'wemaster';
    this.cdnDomain = 'https://wemaster.nyc3.cdn.digitaloceanspaces.com';
  }

  private generateKey(file: Express.Multer.File, folder: string): string {
    const timestamp = Date.now();
    const hash = crypto
      .createHash('md5')
      .update(`${file.originalname}${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    const ext = mime.extension(file.mimetype) || 'bin';
    return `${folder}/${timestamp}-${hash}.${ext}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    options: {
      isPublic?: boolean;
      maxSize?: number;
      allowedTypes?: string[];
    } = {},
  ): Promise<{ url: string; key: string }> {
    const {
      isPublic = true,
      maxSize = 10 * 1024 * 1024, // 默认10MB
      allowedTypes = [],
    } = options;

    // 验证文件大小
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小超出限制');
    }

    // 验证文件类型
    if (
      allowedTypes.length > 0 &&
      !allowedTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException('不支持的文件类型');
    }

    const key = this.generateKey(file, folder);

    try {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: isPublic ? 'public-read' : 'private',
          Metadata: {
            originalname: file.originalname,
            mimetype: file.mimetype,
          },
        },
      });

      await upload.done();

      // 记录上传日志
      this.loggerService.info('file-upload', {
        action: 'upload',
        key,
        size: file.size,
        type: file.mimetype,
      });

      // 生成访问URL
      const url = isPublic
        ? `${this.cdnDomain}/${key}`
        : await this.generateSignedUrl(key);

      return { url, key };
    } catch (error) {
      this.loggerService.error('file-upload', {
        action: 'upload-failed',
        error: error.message,
      });
      throw new BadRequestException('文件上传失败');
    }
  }

  async generateSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: key,
      });

      this.loggerService.info('file-delete', {
        action: 'delete',
        key,
      });
    } catch (error) {
      this.loggerService.error('file-delete', {
        action: 'delete-failed',
        error: error.message,
      });
      throw new BadRequestException('文件删除失败');
    }
  }

  async getFileInfo(key: string): Promise<any> {
    try {
      const headObject = await this.s3.headObject({
        Bucket: this.bucket,
        Key: key,
      });

      return {
        key,
        size: headObject.ContentLength,
        type: headObject.ContentType,
        lastModified: headObject.LastModified,
        metadata: headObject.Metadata,
      };
    } catch (error) {
      throw new BadRequestException('获取文件信息失败');
    }
  }

  async generateUploadUrl(
    filename: string,
    folder: string,
    options: {
      maxSize?: number;
      contentType?: string;
      isPublic?: boolean;
    } = {},
  ): Promise<{ uploadUrl: string; key: string }> {
    const {
      maxSize = 10 * 1024 * 1024,
      contentType = mime.lookup(filename) || 'application/octet-stream',
      isPublic = true,
    } = options;

    const key = this.generateKey({ originalname: filename } as any, folder);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ACL: isPublic ? 'public-read' : 'private',
      Metadata: {
        originalname: filename,
        maxSize: maxSize.toString(),
      },
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 3600, // 1小时有效期
    });

    return { uploadUrl, key };
  }
}
