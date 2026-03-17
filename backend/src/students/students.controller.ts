import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { StudentsService, CreateStudentDto, UpdateStudentDto } from './students.service';
import { PdfExportService } from './pdf-export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeacherScopeGuard } from '../auth/teacher-scope.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Gender } from '../entities/student.entity';
import { UserRole } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherPermission } from '../entities/teacher-permission.entity';
import { File } from '../entities/file.entity';
import { FileEntityType } from '../entities/file.entity';

@Controller('students')
@UseGuards(JwtAuthGuard, TeacherScopeGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly pdfExportService: PdfExportService,
    @InjectRepository(TeacherPermission)
    private permissionRepository: Repository<TeacherPermission>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  create(@Body() createStudentDto: CreateStudentDto, @Request() req: any) {
    return this.studentsService.create(createStudentDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('classId') classId?: string,
    @Query('gender') gender?: Gender,
    @Query('isActive') isActive?: string,
    @Query('keyword') keyword?: string,
    @Request() req?: any,
  ) {
    return this.studentsService.findAll(
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 10,
      classId ? parseInt(classId) : undefined,
      gender,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      keyword,
      req.allowedClassIds,
    );
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.studentsService.getStats(req.allowedClassIds);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const student = await this.studentsService.findOne(id);
    
    // 如果教师没有权限访问该班级，则拒绝访问
    if (req.allowedClassIds !== null && req.allowedClassIds !== undefined) {
      if (!req.allowedClassIds.includes(student.classId)) {
        throw new ForbiddenException('没有权限访问此学生信息');
      }
    }
    
    return student;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @Request() req: any,
  ) {
    const student = await this.studentsService.findOne(id);
    
    // 检查教师是否有编辑权限
    if (req.user.role === UserRole.TEACHER) {
      const permission = await this.permissionRepository.findOne({
        where: { teacherId: req.user.userId, classId: student.classId },
      });
      
      if (!permission || !permission.canEdit) {
        throw new ForbiddenException('没有权限编辑此学生信息');
      }
    }
    
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }

  @Get(':id/export')
  async exportPdf(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const student = await this.studentsService.findOne(id);
    
    // 如果教师没有权限访问该班级，则拒绝访问
    if (req.allowedClassIds !== null && req.allowedClassIds !== undefined) {
      if (!req.allowedClassIds.includes(student.classId)) {
        throw new ForbiddenException('没有权限访问此学生信息');
      }
    }

    // 获取相关文件
    const files = await this.fileRepository.find({
      where: { entityType: FileEntityType.STUDENT, entityId: id },
      order: { createdAt: 'DESC' },
    });

    // 生成 PDF
    const pdfBuffer = await this.pdfExportService.exportStudentProfile(student, files);

    // 设置响应头
    const filename = `${student.name}_档案_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(pdfBuffer);
  }
}
