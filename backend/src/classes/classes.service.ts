import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../entities/class.entity';
import { Student } from '../entities/student.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classesRepository: Repository<Class>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const existingClass = await this.classesRepository.findOne({
      where: { name: createClassDto.name },
    });

    if (existingClass) {
      throw new ConflictException('班级名称已存在');
    }

    const classEntity = this.classesRepository.create(createClassDto);
    return this.classesRepository.save(classEntity);
  }

  async findAll(
    page = 1,
    pageSize = 10,
    isActive?: boolean,
    keyword?: string,
  ): Promise<{ data: Class[]; total: number }> {
    const queryBuilder = this.classesRepository.createQueryBuilder('cls');

    if (isActive !== undefined) {
      queryBuilder.andWhere('cls.isActive = :isActive', { isActive });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(cls.name LIKE :keyword OR cls.grade LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('cls.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    // 获取每个班级的学生数量
    const classIds = data.map((c) => c.id);
    const studentCounts = await this.studentsRepository
      .createQueryBuilder('student')
      .select('student.classId', 'classId')
      .addSelect('COUNT(student.id)', 'count')
      .where('student.classId IN (:...classIds)', { classIds })
      .groupBy('student.classId')
      .getRawMany();

    const countMap = new Map(
      studentCounts.map((s) => [s.classId, parseInt(s.count)]),
    );

    (data as any[]).forEach((cls) => {
      cls.studentCount = countMap.get(cls.id) || 0;
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classesRepository.findOne({
      where: { id },
    });

    if (!classEntity) {
      throw new NotFoundException('班级不存在');
    }

    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const classEntity = await this.findOne(id);

    if (
      updateClassDto.name &&
      updateClassDto.name !== classEntity.name
    ) {
      const existingClass = await this.classesRepository.findOne({
        where: { name: updateClassDto.name },
      });
      if (existingClass) {
        throw new ConflictException('班级名称已存在');
      }
    }

    Object.assign(classEntity, updateClassDto);
    return this.classesRepository.save(classEntity);
  }

  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);

    // 检查班级是否有学生
    const studentCount = await this.studentsRepository.count({
      where: { classId: id },
    });

    if (studentCount > 0) {
      throw new ConflictException('班级下还有学生，无法删除');
    }

    await this.classesRepository.remove(classEntity);
  }

  async getAll(): Promise<Class[]> {
    return this.classesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }
}

export class CreateClassDto {
  name: string;
  grade?: string;
  year?: number;
  description?: string;
}

export class UpdateClassDto {
  name?: string;
  grade?: string;
  year?: number;
  description?: string;
  isActive?: boolean;
}
