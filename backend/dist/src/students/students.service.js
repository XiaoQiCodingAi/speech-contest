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
exports.UpdateStudentDto = exports.CreateStudentDto = exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../entities/student.entity");
const class_entity_1 = require("../entities/class.entity");
const user_entity_1 = require("../entities/user.entity");
const class_validator_1 = require("class-validator");
let StudentsService = class StudentsService {
    studentsRepository;
    classRepository;
    userRepository;
    constructor(studentsRepository, classRepository, userRepository) {
        this.studentsRepository = studentsRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }
    async create(createStudentDto, userId) {
        const existingStudent = await this.studentsRepository.findOne({
            where: { studentNo: createStudentDto.studentNo },
        });
        if (existingStudent) {
            throw new common_1.ConflictException('学号已存在');
        }
        const classEntity = await this.classRepository.findOne({
            where: { id: createStudentDto.classId },
        });
        if (!classEntity) {
            throw new common_1.NotFoundException('班级不存在');
        }
        const student = this.studentsRepository.create({
            ...createStudentDto,
            createdBy: userId,
        });
        const savedStudent = await this.studentsRepository.save(student);
        return this.findOne(savedStudent.id);
    }
    async findAll(page = 1, pageSize = 10, classId, gender, isActive, keyword, allowedClassIds) {
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
            queryBuilder.andWhere('(student.name LIKE :keyword OR student.studentNo LIKE :keyword OR student.phone LIKE :keyword)', { keyword: `%${keyword}%` });
        }
        queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy('student.createdAt', 'DESC');
        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }
    async findOne(id) {
        const student = await this.studentsRepository.findOne({
            where: { id },
            relations: ['class', 'creator'],
        });
        if (!student) {
            throw new common_1.NotFoundException('学生不存在');
        }
        return student;
    }
    async update(id, updateStudentDto) {
        const student = await this.findOne(id);
        if (updateStudentDto.studentNo &&
            updateStudentDto.studentNo !== student.studentNo) {
            const existingStudent = await this.studentsRepository.findOne({
                where: { studentNo: updateStudentDto.studentNo },
            });
            if (existingStudent) {
                throw new common_1.ConflictException('学号已存在');
            }
        }
        if (updateStudentDto.classId) {
            const classEntity = await this.classRepository.findOne({
                where: { id: updateStudentDto.classId },
            });
            if (!classEntity) {
                throw new common_1.NotFoundException('班级不存在');
            }
        }
        Object.assign(student, updateStudentDto);
        await this.studentsRepository.save(student);
        return this.findOne(id);
    }
    async remove(id) {
        const student = await this.findOne(id);
        await this.studentsRepository.remove(student);
    }
    async getStats(allowedClassIds) {
        const queryBuilder = this.studentsRepository.createQueryBuilder('student');
        if (allowedClassIds && allowedClassIds.length > 0) {
            queryBuilder.andWhere('student.classId IN (:...allowedClassIds)', {
                allowedClassIds,
            });
        }
        else if (allowedClassIds !== null && allowedClassIds?.length === 0) {
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
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentsService);
class CreateStudentDto {
    studentNo;
    name;
    gender;
    birthDate;
    phone;
    parentPhone;
    address;
    remarks;
    classId;
}
exports.CreateStudentDto = CreateStudentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "studentNo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(student_entity_1.Gender),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "parentPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "remarks", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStudentDto.prototype, "classId", void 0);
class UpdateStudentDto {
    studentNo;
    name;
    gender;
    birthDate;
    phone;
    parentPhone;
    address;
    remarks;
    classId;
    isActive;
}
exports.UpdateStudentDto = UpdateStudentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "studentNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(student_entity_1.Gender),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "parentPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "remarks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateStudentDto.prototype, "classId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateStudentDto.prototype, "isActive", void 0);
//# sourceMappingURL=students.service.js.map