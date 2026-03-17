"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClassDto = exports.CreateClassDto = exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("../entities/class.entity");
const student_entity_1 = require("../entities/student.entity");
let ClassesService = class ClassesService {
    classesRepository;
    studentsRepository;
    constructor(classesRepository, studentsRepository) {
        this.classesRepository = classesRepository;
        this.studentsRepository = studentsRepository;
    }
    async create(createClassDto) {
        const existingClass = await this.classesRepository.findOne({
            where: { name: createClassDto.name },
        });
        if (existingClass) {
            throw new common_1.ConflictException('班级名称已存在');
        }
        const classEntity = this.classesRepository.create(createClassDto);
        return this.classesRepository.save(classEntity);
    }
    async findAll(page = 1, pageSize = 10, isActive, keyword) {
        const queryBuilder = this.classesRepository.createQueryBuilder('cls');
        if (isActive !== undefined) {
            queryBuilder.andWhere('cls.isActive = :isActive', { isActive });
        }
        if (keyword) {
            queryBuilder.andWhere('(cls.name LIKE :keyword OR cls.grade LIKE :keyword)', { keyword: `%${keyword}%` });
        }
        queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy('cls.createdAt', 'DESC');
        const [data, total] = await queryBuilder.getManyAndCount();
        const classIds = data.map((c) => c.id);
        const studentCounts = await this.studentsRepository
            .createQueryBuilder('student')
            .select('student.classId', 'classId')
            .addSelect('COUNT(student.id)', 'count')
            .where('student.classId IN (:...classIds)', { classIds })
            .groupBy('student.classId')
            .getRawMany();
        const countMap = new Map(studentCounts.map((s) => [s.classId, parseInt(s.count)]));
        data.forEach((cls) => {
            cls.studentCount = countMap.get(cls.id) || 0;
        });
        return { data, total };
    }
    async findOne(id) {
        const classEntity = await this.classesRepository.findOne({
            where: { id },
        });
        if (!classEntity) {
            throw new common_1.NotFoundException('班级不存在');
        }
        return classEntity;
    }
    async update(id, updateClassDto) {
        const classEntity = await this.findOne(id);
        if (updateClassDto.name &&
            updateClassDto.name !== classEntity.name) {
            const existingClass = await this.classesRepository.findOne({
                where: { name: updateClassDto.name },
            });
            if (existingClass) {
                throw new common_1.ConflictException('班级名称已存在');
            }
        }
        Object.assign(classEntity, updateClassDto);
        return this.classesRepository.save(classEntity);
    }
    async remove(id) {
        const classEntity = await this.findOne(id);
        const studentCount = await this.studentsRepository.count({
            where: { classId: id },
        });
        if (studentCount > 0) {
            throw new common_1.ConflictException('班级下还有学生，无法删除');
        }
        await this.classesRepository.remove(classEntity);
    }
    async getAll() {
        return this.classesRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ClassesService);
class CreateClassDto {
    name;
    grade;
    year;
    description;
}
exports.CreateClassDto = CreateClassDto;
class UpdateClassDto {
    name;
    grade;
    year;
    description;
    isActive;
}
exports.UpdateClassDto = UpdateClassDto;
//# sourceMappingURL=classes.service.js.map