import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Response,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from './storage.service';
import { FileAccessLevel, FileCategory } from './file.entity';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body('courseId') courseId?: string,
    @Body('category') category?: FileCategory,
    @Body('accessLevel') accessLevel?: FileAccessLevel,
    @Body('description') description?: string,
    @Body('tags') tags?: string[],
    @Body('expiresAt') expiresAt?: Date,
  ) {
    return this.storageService.uploadFile(file, req.user.id, {
      courseId,
      category,
      accessLevel,
      description,
      tags,
      expiresAt,
    });
  }

  @Get('files')
  async getUserFiles(
    @Request() req,
    @Query('category') category?: FileCategory,
    @Query('courseId') courseId?: string,
    @Query('archived') archived?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storageService.getUserFiles(req.user.id, {
      category,
      courseId,
      archived,
      page,
      limit,
    });
  }

  @Get('shared')
  async getSharedFiles(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storageService.getSharedFiles(req.user.id, { page, limit });
  }

  @Get('files/:id')
  async getFile(@Param('id') id: string, @Request() req) {
    return this.storageService.getFile(id, req.user.id);
  }

  @Get('files/:id/download')
  async downloadFile(
    @Param('id') id: string,
    @Request() req,
    @Response({ passthrough: true }) res,
  ) {
    const { path, filename } = await this.storageService.downloadFile(
      id,
      req.user.id,
    );

    const file = createReadStream(join(process.cwd(), path));
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(file);
  }

  @Post('files/:id/share')
  async shareFile(
    @Param('id') id: string,
    @Request() req,
    @Body('userId') userId: string,
    @Body('permission') permission?: string,
    @Body('expiresAt') expiresAt?: Date,
  ) {
    return this.storageService.shareFile(
      id,
      req.user.id,
      userId,
      permission,
      expiresAt,
    );
  }

  @Post('files/:id/temporary-link')
  async generateTemporaryLink(
    @Param('id') id: string,
    @Request() req,
    @Body('expiresIn') expiresIn?: number,
  ) {
    return this.storageService.generateTemporaryLink(
      id,
      req.user.id,
      expiresIn,
    );
  }

  @Delete('files/:id')
  async deleteFile(@Param('id') id: string, @Request() req) {
    await this.storageService.deleteFile(id, req.user.id);
    return { message: 'File deleted successfully' };
  }

  @Put('files/:id/archive')
  async archiveFile(@Param('id') id: string, @Request() req) {
    return this.storageService.archiveFile(id, req.user.id);
  }
}
