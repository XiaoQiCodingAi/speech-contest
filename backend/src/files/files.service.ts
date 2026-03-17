import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { File, FileType, FileEntityType } from '../entities/file.entity';
import { User } from '../entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../entities/audit-log.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditLogsService: AuditLogsService,
  ) {
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    userId: number,
    entityType?: FileEntityType,
    entityId?: number,
    description?: string,
    folderId?: number,
  ): Promise<File> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 修复中文文件名编码问题：Multer 使用 latin1 解码，需要转换回 utf-8
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // 确定文件类型
    let fileType = FileType.OTHER;
    if (file.mimetype.startsWith('image/')) {
      fileType = FileType.IMAGE;
    } else if (
      file.mimetype.includes('pdf') ||
      file.mimetype.includes('document') ||
      file.mimetype.includes('text') ||
      file.mimetype.includes('sheet') ||
      file.mimetype.includes('presentation')
    ) {
      fileType = FileType.DOCUMENT;
    }

    // 生成唯一文件名
    const ext = path.extname(originalName);
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    // 保存文件
    fs.writeFileSync(filePath, file.buffer);

    const fileEntity = this.fileRepository.create({
      filename,
      originalName,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      type: fileType,
      entityType,
      entityId,
      description,
      folderId,
      uploadedBy: userId,
    });

    const savedFile = await this.fileRepository.save(fileEntity);

    // 记录操作日志
    await this.auditLogsService.log(
      AuditAction.CREATE,
      'File',
      userId,
      '',
      savedFile.id,
      undefined,
      { filename: savedFile.filename, originalName: savedFile.originalName },
      `上传文件: ${savedFile.originalName}`,
    );

    return savedFile;
  }

  async download(id: number, userId: number): Promise<{ file: File; buffer: Buffer }> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    if (!fs.existsSync(file.path)) {
      throw new NotFoundException('文件已被删除');
    }

    const buffer = fs.readFileSync(file.path);

    // 记录操作日志
    await this.auditLogsService.log(
      AuditAction.READ,
      'File',
      userId,
      '',
      file.id,
      undefined,
      undefined,
      `下载文件: ${file.originalName}`,
    );

    return { file, buffer };
  }

  async findByEntity(entityType: FileEntityType, entityId: number, folderId?: number): Promise<File[]> {
    const where: any = { entityType, entityId };
    if (folderId !== undefined) {
      where.folderId = folderId;
    }
    return this.fileRepository.find({
      where,
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async move(id: number, folderId: number | null): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }
    (file as any).folderId = folderId;
    return this.fileRepository.save(file);
  }

  async findOne(id: number): Promise<File | null> {
    return this.fileRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });
  }

  async findAll(query: {
    page?: number;
    pageSize?: number;
    type?: FileType;
    entityType?: FileEntityType;
    entityId?: number;
  }): Promise<{ data: File[]; total: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const qb = this.fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.uploader', 'uploader');

    if (query.type) {
      qb.andWhere('file.type = :type', { type: query.type });
    }

    if (query.entityType) {
      qb.andWhere('file.entityType = :entityType', { entityType: query.entityType });
    }

    if (query.entityId) {
      qb.andWhere('file.entityId = :entityId', { entityId: query.entityId });
    }

    qb.orderBy('file.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async remove(id: number, userId: number): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    // 删除物理文件
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // 记录操作日志
    await this.auditLogsService.log(
      AuditAction.DELETE,
      'File',
      userId,
      '',
      file.id,
      { filename: file.filename, originalName: file.originalName },
      undefined,
      `删除文件: ${file.originalName}`,
    );

    await this.fileRepository.remove(file);
  }

  async getStats(): Promise<{ total: number; totalSize: number; byType: Record<string, number> }> {
    const files = await this.fileRepository.find();

    const byType: Record<string, number> = {};
    let totalSize = 0;

    files.forEach(file => {
      byType[file.type] = (byType[file.type] || 0) + 1;
      totalSize += file.size;
    });

    return {
      total: files.length,
      totalSize,
      byType,
    };
  }
}
