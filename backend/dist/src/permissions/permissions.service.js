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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const teacher_permission_entity_1 = require("../entities/teacher-permission.entity");
const user_entity_1 = require("../entities/user.entity");
const class_entity_1 = require("../entities/class.entity");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const audit_log_entity_1 = require("../entities/audit-log.entity");
let PermissionsService = class PermissionsService {
    permissionRepository;
    userRepository;
    classRepository;
    auditLogsService;
    constructor(permissionRepository, userRepository, classRepository, auditLogsService) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.auditLogsService = auditLogsService;
    }
    async getTeacherPermissions(teacherId) {
        const teacher = await this.userRepository.findOne({ where: { id: teacherId } });
        if (!teacher) {
            throw new common_1.NotFoundException('教师不存在');
        }
        const permissions = await this.permissionRepository.find({
            where: { teacherId },
            relations: ['class', 'grantedBy'],
        });
        return permissions.map(p => ({
            id: p.id,
            classId: p.classId,
            className: p.class?.name,
            canView: p.canView,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
            grantedBy: p.grantedBy?.name,
            createdAt: p.createdAt,
        }));
    }
    async getAllTeachersWithPermissions() {
        const teachers = await this.userRepository.find({
            where: { role: user_entity_1.UserRole.TEACHER },
            order: { name: 'ASC' },
        });
        const result = [];
        for (const teacher of teachers) {
            const permissions = await this.permissionRepository.find({
                where: { teacherId: teacher.id },
                relations: ['class'],
            });
            result.push({
                id: teacher.id,
                name: teacher.name,
                username: teacher.username,
                permissions: permissions.map(p => ({
                    classId: p.classId,
                    className: p.class?.name || '',
                    canView: p.canView,
                    canEdit: p.canEdit,
                    canDelete: p.canDelete,
                })),
            });
        }
        return result;
    }
    async setTeacherPermissions(teacherId, classIds, grantedById, permissions = {}) {
        const teacher = await this.userRepository.findOne({ where: { id: teacherId } });
        if (!teacher) {
            throw new common_1.NotFoundException('教师不存在');
        }
        if (teacher.role !== user_entity_1.UserRole.TEACHER) {
            throw new common_1.BadRequestException('只能为教师角色配置权限');
        }
        await this.permissionRepository.delete({ teacherId });
        const newPermissions = [];
        for (const classId of classIds) {
            const cls = await this.classRepository.findOne({ where: { id: classId } });
            if (!cls)
                continue;
            const permission = this.permissionRepository.create({
                teacherId,
                classId,
                canView: permissions.canView ?? true,
                canEdit: permissions.canEdit ?? false,
                canDelete: permissions.canDelete ?? false,
                grantedById,
            });
            newPermissions.push(permission);
        }
        const saved = await this.permissionRepository.save(newPermissions);
        await this.auditLogsService.log(audit_log_entity_1.AuditAction.UPDATE, 'TeacherPermission', grantedById, '', teacherId, undefined, { classIds, permissions }, `更新教师权限: ${teacher.name}`);
        return saved;
    }
    async updatePermission(permissionId, updates, userId) {
        const permission = await this.permissionRepository.findOne({
            where: { id: permissionId },
            relations: ['teacher', 'class'],
        });
        if (!permission) {
            throw new common_1.NotFoundException('权限记录不存在');
        }
        Object.assign(permission, updates);
        const saved = await this.permissionRepository.save(permission);
        await this.auditLogsService.log(audit_log_entity_1.AuditAction.UPDATE, 'TeacherPermission', userId, '', permissionId, undefined, updates, `更新权限: ${permission.teacher?.name} 对 ${permission.class?.name}`);
        return saved;
    }
    async removePermission(permissionId, userId) {
        const permission = await this.permissionRepository.findOne({
            where: { id: permissionId },
            relations: ['teacher', 'class'],
        });
        if (!permission) {
            throw new common_1.NotFoundException('权限记录不存在');
        }
        await this.permissionRepository.remove(permission);
        await this.auditLogsService.log(audit_log_entity_1.AuditAction.DELETE, 'TeacherPermission', userId, '', permissionId, undefined, undefined, `删除权限: ${permission.teacher?.name} 对 ${permission.class?.name}`);
    }
    async checkPermission(teacherId, classId, action) {
        const permission = await this.permissionRepository.findOne({
            where: { teacherId, classId },
        });
        if (!permission)
            return false;
        switch (action) {
            case 'view':
                return permission.canView;
            case 'edit':
                return permission.canEdit;
            case 'delete':
                return permission.canDelete;
            default:
                return false;
        }
    }
    async getAccessibleClasses(teacherId) {
        const permissions = await this.permissionRepository.find({
            where: { teacherId, canView: true },
            relations: ['class'],
        });
        return permissions.map(p => p.class).filter(Boolean);
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_permission_entity_1.TeacherPermission)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_logs_service_1.AuditLogsService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map