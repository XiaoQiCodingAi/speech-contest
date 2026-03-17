import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher, Gender, TeacherStatus } from '../entities/teacher.entity';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { appConfig } from '../config/app.config';
import { CreateTeacherDto, UpdateTeacherDto } from './teachers.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teachersRepository: Repository<Teacher>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const existingTeacher = await this.teachersRepository.findOne({
      where: { employeeNo: createTeacherDto.employeeNo },
    });

    if (existingTeacher) {
      throw new ConflictException('工号已存在');
    }

    // 创建用户账号，使用配置的默认密码
    const user = this.userRepository.create({
      username: createTeacherDto.employeeNo,
      password: await bcrypt.hash(appConfig.teacher.defaultPassword, 10),
      name: createTeacherDto.name,
      role: UserRole.TEACHER,
      phone: createTeacherDto.phone,
      email: createTeacherDto.email,
    });
    const savedUser = await this.userRepository.save(user);

    const teacher = this.teachersRepository.create({
      ...createTeacherDto,
      userId: savedUser.id,
    });

    const savedTeacher = await this.teachersRepository.save(teacher);
    return this.findOne(savedTeacher.id);
  }

  async findAll(
    page = 1,
    pageSize = 10,
    status?: TeacherStatus,
    department?: string,
    keyword?: string,
  ): Promise<{ data: Teacher[]; total: number }> {
    const queryBuilder = this.teachersRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user');

    if (status) {
      queryBuilder.andWhere('teacher.status = :status', { status });
    }

    if (department) {
      queryBuilder.andWhere('teacher.department = :department', { department });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(teacher.name LIKE :keyword OR teacher.employeeNo LIKE :keyword OR teacher.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('teacher.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException('教师不存在');
    }

    return teacher;
  }

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const teacher = await this.findOne(id);

    if (
      updateTeacherDto.employeeNo &&
      updateTeacherDto.employeeNo !== teacher.employeeNo
    ) {
      const existingTeacher = await this.teachersRepository.findOne({
        where: { employeeNo: updateTeacherDto.employeeNo },
      });
      if (existingTeacher) {
        throw new ConflictException('工号已存在');
      }
    }

    Object.assign(teacher, updateTeacherDto);
    await this.teachersRepository.save(teacher);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const teacher = await this.findOne(id);
    
    // 停用关联的用户账号（而不是删除）
    await this.userRepository.update(teacher.userId, { isActive: false });
    
    // 停用教师账号
    await this.teachersRepository.update(id, { status: TeacherStatus.RESIGNED });
  }

  async resetPassword(id: number): Promise<void> {
    const teacher = await this.findOne(id);
    
    // 重置密码为默认密码
    const hashedPassword = await bcrypt.hash(appConfig.teacher.defaultPassword, 10);
    await this.userRepository.update(teacher.userId, { 
      password: hashedPassword,
      isActive: true, // 重置密码时激活账号
    });
  }

  async getStats(): Promise<any> {
    const total = await this.teachersRepository.count();
    const active = await this.teachersRepository.count({
      where: { status: TeacherStatus.ACTIVE },
    });
    const byDepartment = await this.teachersRepository
      .createQueryBuilder('teacher')
      .select('teacher.department', 'department')
      .addSelect('COUNT(teacher.id)', 'count')
      .groupBy('teacher.department')
      .getRawMany();

    return { total, active, byDepartment };
  }
}
