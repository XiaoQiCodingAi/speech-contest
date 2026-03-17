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
} from '@nestjs/common';
import { ClassesService, CreateClassDto, UpdateClassDto } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherPermission } from '../entities/teacher-permission.entity';

@Controller('classes')
@UseGuards(JwtAuthGuard)
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    @InjectRepository(TeacherPermission)
    private permissionRepository: Repository<TeacherPermission>,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('isActive') isActive?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.classesService.findAll(
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 10,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      keyword,
    );
  }

  @Get('all')
  async getAll(@Request() req: any) {
    const user = req.user;
    
    // 管理员和领导可以查看所有班级
    if (user.role === UserRole.ADMIN || user.role === UserRole.LEADER) {
      return this.classesService.getAll();
    }
    
    // 教师只能查看有权限的班级
    if (user.role === UserRole.TEACHER) {
      const permissions = await this.permissionRepository.find({
        where: { teacherId: user.userId, canView: true },
        relations: ['class'],
      });
      
      return permissions
        .map((p) => p.class)
        .filter((c) => c && c.isActive)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return [];
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LEADER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }
}
