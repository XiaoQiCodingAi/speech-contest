"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const teacher_entity_1 = require("../entities/teacher.entity");
const user_entity_1 = require("../entities/user.entity");
const bcrypt = __importStar(require("bcryptjs"));
const app_config_1 = require("../config/app.config");
let TeachersService = class TeachersService {
    teachersRepository;
    userRepository;
    constructor(teachersRepository, userRepository) {
        this.teachersRepository = teachersRepository;
        this.userRepository = userRepository;
    }
    async create(createTeacherDto) {
        const existingTeacher = await this.teachersRepository.findOne({
            where: { employeeNo: createTeacherDto.employeeNo },
        });
        if (existingTeacher) {
            throw new common_1.ConflictException('工号已存在');
        }
        const user = this.userRepository.create({
            username: createTeacherDto.employeeNo,
            password: await bcrypt.hash(app_config_1.appConfig.teacher.defaultPassword, 10),
            name: createTeacherDto.name,
            role: user_entity_1.UserRole.TEACHER,
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
    async findAll(page = 1, pageSize = 10, status, department, keyword) {
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
            queryBuilder.andWhere('(teacher.name LIKE :keyword OR teacher.employeeNo LIKE :keyword OR teacher.phone LIKE :keyword)', { keyword: `%${keyword}%` });
        }
        queryBuilder
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .orderBy('teacher.createdAt', 'DESC');
        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }
    async findOne(id) {
        const teacher = await this.teachersRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!teacher) {
            throw new common_1.NotFoundException('教师不存在');
        }
        return teacher;
    }
    async update(id, updateTeacherDto) {
        const teacher = await this.findOne(id);
        if (updateTeacherDto.employeeNo &&
            updateTeacherDto.employeeNo !== teacher.employeeNo) {
            const existingTeacher = await this.teachersRepository.findOne({
                where: { employeeNo: updateTeacherDto.employeeNo },
            });
            if (existingTeacher) {
                throw new common_1.ConflictException('工号已存在');
            }
        }
        Object.assign(teacher, updateTeacherDto);
        await this.teachersRepository.save(teacher);
        return this.findOne(id);
    }
    async remove(id) {
        const teacher = await this.findOne(id);
        await this.userRepository.update(teacher.userId, { isActive: false });
        await this.teachersRepository.update(id, { status: teacher_entity_1.TeacherStatus.RESIGNED });
    }
    async resetPassword(id) {
        const teacher = await this.findOne(id);
        const hashedPassword = await bcrypt.hash(app_config_1.appConfig.teacher.defaultPassword, 10);
        await this.userRepository.update(teacher.userId, {
            password: hashedPassword,
            isActive: true,
        });
    }
    async getStats() {
        const total = await this.teachersRepository.count();
        const active = await this.teachersRepository.count({
            where: { status: teacher_entity_1.TeacherStatus.ACTIVE },
        });
        const byDepartment = await this.teachersRepository
            .createQueryBuilder('teacher')
            .select('teacher.department', 'department')
            .addSelect('COUNT(teacher.id)', 'count')
            .groupBy('teacher.department')
            .getRawMany();
        return { total, active, byDepartment };
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map