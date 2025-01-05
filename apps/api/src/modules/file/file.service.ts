import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary } from 'cloudinary'
import { RedisService } from '../redis/redis.service'
import { LoggerService } from '../logger/logger.service'
import * as sharp from 'sharp'
import * as ffmpeg from 'fluent-ffmpeg'
import * as path from 'path'

@Injectable()
export class FileService {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private loggerService: LoggerService
  ) {
    // 初始化Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET')
    })
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    options: { 
      resourceType?: string,
      transformation?: any[]
    } = {}
  ): Promise<string> {
    try {
      const uploadResponse = await this.uploadToCloudinary(file, folder, options)
      
      // 缓存文件信息
      await this.cacheFileInfo(uploadResponse.public_id, uploadResponse)
      
      // 记录上传日志
      this.loggerService.log('file-upload', {
        action: 'upload',
        publicId: uploadResponse.public_id,
        size: file.size,
        type: file.mimetype
      })

      return uploadResponse.secure_url
    } catch (error) {
      this.loggerService.error('file-upload', {
        action: 'upload-failed',
        error: error.message
      })
      throw new BadRequestException('文件上传失败')
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
    options: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: options.resourceType || 'auto',
          transformation: options.transformation,
          // 添加标签用于管理
          tags: ['wemaster', folder],
          // 设置访问控制
          access_mode: 'public'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      // 将文件buffer写入流
      uploadStream.end(file.buffer)
    })
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: string
  ): Promise<{ url: string; thumbnailUrl: string }> {
    const uploadResponse = await this.uploadFile(file, folder, {
      resourceType: 'video',
      transformation: [
        // 视频优化设置
        { quality: 'auto' },
        { fetch_format: 'auto' },
        // 自适应比特率流
        { streaming_profile: 'hd' }
      ]
    })

    // 生成缩略图
    const thumbnailUrl = cloudinary.url(uploadResponse.public_id, {
      resource_type: 'video',
      transformation: [
        { width: 320, crop: 'scale' },
        { start_offset: '0' },
        { format: 'jpg' }
      ]
    })

    return { url: uploadResponse, thumbnailUrl }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    options: {
      width?: number
      height?: number
      crop?: string
    } = {}
  ): Promise<string> {
    return this.uploadFile(file, folder, {
      resourceType: 'image',
      transformation: [
        {
          width: options.width || 1920,
          height: options.height,
          crop: options.crop || 'limit',
          quality: 'auto',
          fetch_format: 'auto'
        }
      ]
    })
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    return this.uploadFile(file, folder, {
      resourceType: 'raw'
    })
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
      
      // 删除缓存
      await this.redisService.del(`file:${publicId}`)
      
      this.loggerService.log('file-delete', {
        action: 'delete',
        publicId
      })
    } catch (error) {
      this.loggerService.error('file-delete', {
        action: 'delete-failed',
        error: error.message
      })
      throw new BadRequestException('文件删除失败')
    }
  }

  async getFileInfo(publicId: string): Promise<any> {
    // 先从缓存获取
    const cached = await this.redisService.get(`file:${publicId}`)
    if (cached) return JSON.parse(cached)

    // 缓存未命中，从Cloudinary获取
    try {
      const result = await cloudinary.api.resource(publicId)
      
      // 更新缓存
      await this.cacheFileInfo(publicId, result)
      
      return result
    } catch (error) {
      throw new BadRequestException('获取文件信息失败')
    }
  }

  private async cacheFileInfo(publicId: string, info: any): Promise<void> {
    await this.redisService.set(
      `file:${publicId}`,
      JSON.stringify(info),
      60 * 60 // 1小时缓存
    )
  }

  // YouTube视频支持
  async getYoutubeEmbedUrl(youtubeUrl: string): Promise<string> {
    const videoId = this.extractYoutubeVideoId(youtubeUrl)
    if (!videoId) {
      throw new BadRequestException('无效的YouTube链接')
    }
    return `https://www.youtube.com/embed/${videoId}`
  }

  private extractYoutubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // 生成签名URL
  async generateSignedUrl(publicId: string, expiresIn = 3600): Promise<string> {
    return cloudinary.utils.private_download_url(publicId, '', {
      type: 'upload',
      expires_at: Math.floor(Date.now() / 1000) + expiresIn
    })
  }

  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer()
    } catch (error) {
      throw new BadRequestException('图片处理失败')
    }
  }

  private async processVideo(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(buffer)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size('1280x720')
        .on('end', () => {
          // 读取处理后的视频文件
          resolve(buffer) // 这里需要读取处理后的文件
        })
        .on('error', (err) => {
          reject(new BadRequestException('视频处理失败: ' + err.message))
        })
        .save(buffer)
    })
  }

  async generateThumbnail(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const thumbnailKey = `thumbnails/${uuidv4()}.jpg`

      ffmpeg(videoUrl)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: thumbnailKey,
          folder: '/tmp',
          size: '320x180'
        })
        .on('end', async () => {
          try {
            // 读取生成的缩略图
            const thumbnailBuffer = Buffer.from('') // 这里需要读取生成的缩略图文件
            const url = await this.uploadToCloudinary(
              thumbnailBuffer,
              thumbnailKey,
              {
                resourceType: 'image',
                transformation: [
                  {
                    width: 320,
                    height: 180,
                    crop: 'fill',
                    quality: 'auto',
                    fetch_format: 'auto'
                  }
                ]
              }
            )
            resolve(url)
          } catch (error) {
            reject(new BadRequestException('缩略图上传失败'))
          }
        })
        .on('error', (err) => {
          reject(new BadRequestException('缩略图生成失败: ' + err.message))
        })
    })
  }
}
