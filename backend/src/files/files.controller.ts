import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Res,
  Body,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { UserRole } from '../entities/user.entity';
import { FileType, FileEntityType } from '../entities/file.entity';

@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.LEADER, UserRole.TEACHER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 限制
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body() body: any,
  ) {
    if (!file) {
      return { error: '请选择文件' };
    }

    const entityType = body.entityType as FileEntityType;
    const entityId = body.entityId ? parseInt(body.entityId, 10) : undefined;
    const folderId = body.folderId ? parseInt(body.folderId, 10) : undefined;

    const uploadedFile = await this.filesService.upload(
      file,
      req.user.userId,
      entityType,
      entityId,
      body.description,
      folderId,
    );

    return {
      id: uploadedFile.id,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      type: uploadedFile.type,
      createdAt: uploadedFile.createdAt,
    };
  }

  @Get('download/:id')
  @Public()
  async download(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    // 通过 query 参数中的 token 验证
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    const userId = this.extractUserIdFromToken(token);
    
    if (!userId) {
      return res.status(401).json({ error: '无效的token' });
    }

    const idNum = parseInt(id, 10);
    const { file, buffer } = await this.filesService.download(idNum, userId);

    // 使用 RFC 5987 编码支持中文文件名
    const encodedFilename = encodeURIComponent(file.originalName);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    res.send(buffer);
  }

  @Get('preview/:id')
  @Public()
  async preview(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    // 预览接口必须提供 token
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    const userId = this.extractUserIdFromToken(token);
    
    if (!userId) {
      return res.status(401).json({ error: '无效的token' });
    }

    const idNum = parseInt(id, 10);
    const { file, buffer } = await this.filesService.download(idNum, userId);

    // 支持预览图片和PDF文件
    if (!file.mimeType.startsWith('image/') && file.mimeType !== 'application/pdf') {
      return res.status(400).json({ error: '只支持预览图片和PDF文件' });
    }

    // PDF 文件使用 inline 显示，图片直接显示
    const disposition = file.mimeType === 'application/pdf' ? 'inline' : 'attachment';
    const encodedFilename = encodeURIComponent(file.originalName);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  }

  private extractUserIdFromToken(token: string): number | null {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'school-archive-secret-key-change-in-production') as any;
      return decoded.sub;
    } catch (error) {
      return null;
    }
  }

  @Get('entity/:type/:id')
  async findByEntity(
    @Param('type') type: FileEntityType,
    @Param('id') id: string,
    @Query('folderId') folderId?: string,
  ) {
    const idNum = parseInt(id, 10);
    const folderIdNum = folderId ? parseInt(folderId, 10) : undefined;
    const files = await this.filesService.findByEntity(type, idNum, folderIdNum);
    return files.map(f => ({
      id: f.id,
      filename: f.filename,
      originalName: f.originalName,
      mimeType: f.mimeType,
      size: f.size,
      type: f.type,
      description: f.description,
      folderId: f.folderId,
      createdAt: f.createdAt,
      uploader: f.uploader ? { id: f.uploader.id, name: f.uploader.name } : null,
    }));
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('type') type?: FileType,
    @Query('entityType') entityType?: FileEntityType,
    @Query('entityId') entityId?: string,
  ) {
    const result = await this.filesService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      type,
      entityType,
      entityId: entityId ? parseInt(entityId, 10) : undefined,
    });

    return {
      data: result.data.map(f => ({
        id: f.id,
        filename: f.filename,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        type: f.type,
        entityType: f.entityType,
        entityId: f.entityId,
        description: f.description,
        createdAt: f.createdAt,
        uploader: f.uploader ? { id: f.uploader.id, name: f.uploader.name } : null,
      })),
      total: result.total,
    };
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  async getStats() {
    return this.filesService.getStats();
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const idNum = parseInt(id, 10);
    
    // 获取文件信息以检查权限
    const file = await this.filesService.findOne(idNum);
    
    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    // 检查权限：管理员和领导可以删除任何文件，教师只能删除自己上传的文件
    const isAdminOrLeader = req.user.role === 'admin' || req.user.role === 'leader';
    const isOwner = file.uploadedBy === req.user.userId;

    if (!isAdminOrLeader && !isOwner) {
      throw new ForbiddenException('无权删除此文件');
    }

    await this.filesService.remove(idNum, req.user.userId);
    return { success: true };
  }

  @Post(':id/move')
  async move(
    @Param('id') id: string,
    @Body() body: { folderId: number | null },
  ) {
    const idNum = parseInt(id, 10);
    return this.filesService.move(idNum, body.folderId);
  }
}
