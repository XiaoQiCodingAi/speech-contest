import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Student, Gender } from '../entities/student.entity';
import { Class } from '../entities/class.entity';
import { User } from '../entities/user.entity';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
    userId: number,
  ): Promise<Student> {
    const existingStudent = await this.studentsRepository.findOne({
      where: { studentNo: createStudentDto.studentNo },
    });

    if (existingStudent) {
      throw new ConflictException('学号已存在');
    }

    const classEntity = await this.classRepository.findOne({
      where: { id: createStudentDto.classId },
    });

    if (!classEntity) {
      throw new NotFoundException('班级不存在');
    }

    const student = this.studentsRepository.create({
      ...createStudentDto,
      createdBy: userId,
    });

    const savedStudent = await this.studentsRepository.save(student);
    return this.findOne(savedStudent.id);
  }

  async findAll(
    page = 1,
    pageSize = 10,
    classId?: number,
    gender?: Gender,
    isActive?: boolean,
    keyword?: string,
    allowedClassIds?: number[],
  ): Promise<{ data: Student[]; total: number }> {
    const queryBuilder = this.studentsRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.class', 'class');

    if (allowedClassIds && allowedClassIds.length > 0) {
      queryBuilder.andWhere('student.classId IN (:...allowedClassIds)', {
        allowedClassIds,
      });
    }

    if (classId) {
      queryBuilder.andWhere('student.classId = :classId', { classId });
    }

    if (gender) {
      queryBuilder.andWhere('student.gender = :gender', { gender });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('student.isActive = :isActive', { isActive });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(student.name LIKE :keyword OR student.studentNo LIKE :keyword OR student.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('student.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: ['class', 'creator'],
    });

    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    return student;
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.findOne(id);

    if (
      updateStudentDto.studentNo &&
      updateStudentDto.studentNo !== student.studentNo
    ) {
      const existingStudent = await this.studentsRepository.findOne({
        where: { studentNo: updateStudentDto.studentNo },
      });
      if (existingStudent) {
        throw new ConflictException('学号已存在');
      }
    }

    if (updateStudentDto.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: updateStudentDto.classId },
      });
      if (!classEntity) {
        throw new NotFoundException('班级不存在');
      }
    }

    Object.assign(student, updateStudentDto);
    await this.studentsRepository.save(student);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentsRepository.remove(student);
  }

  async getStats(allowedClassIds?: number[] | null): Promise<any> {
    const queryBuilder = this.studentsRepository.createQueryBuilder('student');
    
    if (allowedClassIds && allowedClassIds.length > 0) {
      queryBuilder.andWhere('student.classId IN (:...allowedClassIds)', {
        allowedClassIds,
      });
    } else if (allowedClassIds !== null && allowedClassIds?.length === 0) {
      // 教师没有任何权限时返回空统计
      return { total: 0, active: 0, byClass: [] };
    }
    
    const total = await queryBuilder.getCount();
    
    const activeQueryBuilder = this.studentsRepository.createQueryBuilder('student')
      .where('student.isActive = :isActive', { isActive: true });
    
    if (allowedClassIds && allowedClassIds.length > 0) {
      activeQueryBuilder.andWhere('student.classId IN (:...allowedClassIds)', {
        allowedClassIds,
      });
    }
    
    const active = await activeQueryBuilder.getCount();
    
    const byClassQueryBuilder = this.studentsRepository
      .createQueryBuilder('student')
      .select('class.name', 'className')
      .addSelect('COUNT(student.id)', 'count')
      .leftJoin('student.class', 'class')
      .groupBy('class.id');
    
    if (allowedClassIds && allowedClassIds.length > 0) {
      byClassQueryBuilder.andWhere('student.classId IN (:...allowedClassIds)', {
        allowedClassIds,
      });
    }
    
    const byClass = await byClassQueryBuilder.getRawMany();

    return { total, active, byClass };
  }
}

export class CreateStudentDto {
  @IsString()
  studentNo: string;
  
  @IsString()
  name: string;
  
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
  
  @IsOptional()
  @IsDateString()
  birthDate?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  parentPhone?: string;
  
  @IsOptional()
  @IsString()
  address?: string;
  
  @IsOptional()
  @IsString()
  remarks?: string;
  
  @IsNumber()
  classId: number;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  studentNo?: string;
  
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
  
  @IsOptional()
  @IsDateString()
  birthDate?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  parentPhone?: string;
  
  @IsOptional()
  @IsString()
  address?: string;
  
  @IsOptional()
  @IsString()
  remarks?: string;
  
  @IsOptional()
  @IsNumber()
  classId?: number;
  
  @IsOptional()
  isActive?: boolean;
}
