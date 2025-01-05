import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SpacesService } from './spaces.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FileController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string,
    @Body('isPublic') isPublic: boolean,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // 根据文件类型设置上传选项
    const options: any = {
      isPublic: isPublic !== false,
      maxSize: 10 * 1024 * 1024, // 10MB
    };

    // 根据文件mimetype设置允许的类型
    if (file.mimetype.startsWith('image/')) {
      options.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      options.maxSize = 5 * 1024 * 1024; // 5MB for images
    } else if (file.mimetype.startsWith('video/')) {
      options.allowedTypes = ['video/mp4', 'video/webm'];
      options.maxSize = 100 * 1024 * 1024; // 100MB for videos
    } else if (file.mimetype === 'application/pdf') {
      options.allowedTypes = ['application/pdf'];
      options.maxSize = 10 * 1024 * 1024; // 10MB for PDFs
    }

    // 添加用户信息到文件夹路径
    const userFolder = `${folder}/${user.id}`;

    return this.spacesService.uploadFile(file, userFolder, options);
  }

  @Post('upload-url')
  async getUploadUrl(
    @Body('filename') filename: string,
    @Body('folder') folder: string,
    @Body('contentType') contentType: string,
    @Body('isPublic') isPublic: boolean,
    @CurrentUser() user: any,
  ) {
    if (!filename || !folder) {
      throw new BadRequestException('Filename and folder are required');
    }

    const userFolder = `${folder}/${user.id}`;

    return this.spacesService.generateUploadUrl(filename, userFolder, {
      contentType,
      isPublic: isPublic !== false,
    });
  }

  @Delete(':key')
  async deleteFile(
    @Param('key') key: string,
    @CurrentUser() user: any,
  ) {
    // 验证文件所属权
    if (!key.includes(`/${user.id}/`) && !user.isAdmin) {
      throw new BadRequestException('无权删除此文件');
    }

    await this.spacesService.deleteFile(key);
    return { success: true };
  }

  @Get('info/:key')
  async getFileInfo(
    @Param('key') key: string,
    @CurrentUser() user: any,
  ) {
    // 验证文件所属权
    if (!key.includes(`/${user.id}/`) && !user.isAdmin) {
      throw new BadRequestException('无权访问此文件信息');
    }

    return this.spacesService.getFileInfo(key);
  }

  @Get('signed-url/:key')
  async getSignedUrl(
    @Param('key') key: string,
    @Query('expiresIn') expiresIn: string,
    @CurrentUser() user: any,
  ) {
    // 验证文件所属权
    if (!key.includes(`/${user.id}/`) && !user.isAdmin) {
      throw new BadRequestException('无权访问此文件');
    }

    const expires = parseInt(expiresIn) || 3600;
    const url = await this.spacesService.generateSignedUrl(key, expires);
    return { url };
  }

  @Post('batch-upload-urls')
  async getBatchUploadUrls(
    @Body('files') files: Array<{ filename: string; contentType?: string }>,
    @Body('folder') folder: string,
    @Body('isPublic') isPublic: boolean,
    @CurrentUser() user: any,
  ) {
    if (!files || !Array.isArray(files)) {
      throw new BadRequestException('Invalid files array');
    }

    const userFolder = `${folder}/${user.id}`;
    const results = await Promise.all(
      files.map(({ filename, contentType }) =>
        this.spacesService.generateUploadUrl(filename, userFolder, {
          contentType,
          isPublic: isPublic !== false,
        }),
      ),
    );

    return results;
  }
}
