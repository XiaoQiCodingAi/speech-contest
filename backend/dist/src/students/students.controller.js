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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const students_service_1 = require("./students.service");
const pdf_export_service_1 = require("./pdf-export.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const teacher_scope_guard_1 = require("../auth/teacher-scope.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const student_entity_1 = require("../entities/student.entity");
const user_entity_1 = require("../entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const teacher_permission_entity_1 = require("../entities/teacher-permission.entity");
const file_entity_1 = require("../entities/file.entity");
const file_entity_2 = require("../entities/file.entity");
let StudentsController = class StudentsController {
    studentsService;
    pdfExportService;
    permissionRepository;
    fileRepository;
    constructor(studentsService, pdfExportService, permissionRepository, fileRepository) {
        this.studentsService = studentsService;
        this.pdfExportService = pdfExportService;
        this.permissionRepository = permissionRepository;
        this.fileRepository = fileRepository;
    }
    create(createStudentDto, req) {
        return this.studentsService.create(createStudentDto, req.user.userId);
    }
    findAll(page, pageSize, classId, gender, isActive, keyword, req) {
        return this.studentsService.findAll(page ? parseInt(page) : 1, pageSize ? parseInt(pageSize) : 10, classId ? parseInt(classId) : undefined, gender, isActive === 'true' ? true : isActive === 'false' ? false : undefined, keyword, req.allowedClassIds);
    }
    getStats(req) {
        return this.studentsService.getStats(req.allowedClassIds);
    }
    async findOne(id, req) {
        const student = await this.studentsService.findOne(id);
        if (req.allowedClassIds !== null && req.allowedClassIds !== undefined) {
            if (!req.allowedClassIds.includes(student.classId)) {
                throw new common_1.ForbiddenException('没有权限访问此学生信息');
            }
        }
        return student;
    }
    async update(id, updateStudentDto, req) {
        const student = await this.studentsService.findOne(id);
        if (req.user.role === user_entity_1.UserRole.TEACHER) {
            const permission = await this.permissionRepository.findOne({
                where: { teacherId: req.user.userId, classId: student.classId },
            });
            if (!permission || !permission.canEdit) {
                throw new common_1.ForbiddenException('没有权限编辑此学生信息');
            }
        }
        return this.studentsService.update(id, updateStudentDto);
    }
    remove(id) {
        return this.studentsService.remove(id);
    }
    async exportPdf(id, req, res) {
        const student = await this.studentsService.findOne(id);
        if (req.allowedClassIds !== null && req.allowedClassIds !== undefined) {
            if (!req.allowedClassIds.includes(student.classId)) {
                throw new common_1.ForbiddenException('没有权限访问此学生信息');
            }
        }
        const files = await this.fileRepository.find({
            where: { entityType: file_entity_2.FileEntityType.STUDENT, entityId: id },
            order: { createdAt: 'DESC' },
        });
        const pdfBuffer = await this.pdfExportService.exportStudentProfile(student, files);
        const filename = `${student.name}_档案_${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.send(pdfBuffer);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.LEADER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [students_service_1.CreateStudentDto, Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('classId')),
    __param(3, (0, common_1.Query)('gender')),
    __param(4, (0, common_1.Query)('isActive')),
    __param(5, (0, common_1.Query)('keyword')),
    __param(6, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, students_service_1.UpdateStudentDto, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.LEADER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "exportPdf", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.Controller)('students'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, teacher_scope_guard_1.TeacherScopeGuard),
    __param(2, (0, typeorm_1.InjectRepository)(teacher_permission_entity_1.TeacherPermission)),
    __param(3, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [students_service_1.StudentsService,
        pdf_export_service_1.PdfExportService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentsController);
//# sourceMappingURL=students.controller.js.map