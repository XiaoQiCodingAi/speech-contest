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
exports.TeacherScopeGuard = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const teacher_permission_entity_1 = require("../entities/teacher-permission.entity");
let TeacherScopeGuard = class TeacherScopeGuard {
    permissionRepository;
    constructor(permissionRepository) {
        this.permissionRepository = permissionRepository;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('用户未登录');
        }
        if (user.role === user_entity_1.UserRole.ADMIN || user.role === user_entity_1.UserRole.LEADER) {
            request.allowedClassIds = null;
            return true;
        }
        if (user.role === user_entity_1.UserRole.TEACHER) {
            const permissions = await this.permissionRepository.find({
                where: { teacherId: user.userId, canView: true },
                select: ['classId'],
            });
            if (permissions.length === 0) {
                request.allowedClassIds = [];
                return true;
            }
            request.allowedClassIds = permissions.map((p) => p.classId);
            return true;
        }
        throw new common_1.ForbiddenException('没有权限执行此操作');
    }
};
exports.TeacherScopeGuard = TeacherScopeGuard;
exports.TeacherScopeGuard = TeacherScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_permission_entity_1.TeacherPermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TeacherScopeGuard);
//# sourceMappingURL=teacher-scope.guard.js.map