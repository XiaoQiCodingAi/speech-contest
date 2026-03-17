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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const permissions_service_1 = require("./permissions.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const user_entity_1 = require("../entities/user.entity");
let PermissionsController = class PermissionsController {
    permissionsService;
    constructor(permissionsService) {
        this.permissionsService = permissionsService;
    }
    async getAllTeachersWithPermissions() {
        return this.permissionsService.getAllTeachersWithPermissions();
    }
    async getTeacherPermissions(id) {
        const idNum = parseInt(id, 10);
        return this.permissionsService.getTeacherPermissions(idNum);
    }
    async setTeacherPermissions(id, body, req) {
        const idNum = parseInt(id, 10);
        return this.permissionsService.setTeacherPermissions(idNum, body.classIds, req.user.userId, {
            canView: body.canView,
            canEdit: body.canEdit,
            canDelete: body.canDelete,
        });
    }
    async updatePermission(id, body, req) {
        const idNum = parseInt(id, 10);
        return this.permissionsService.updatePermission(idNum, body, req.user.userId);
    }
    async removePermission(id, req) {
        const idNum = parseInt(id, 10);
        await this.permissionsService.removePermission(idNum, req.user.userId);
        return { success: true };
    }
    async checkPermission(teacherId, classId, action) {
        const hasPermission = await this.permissionsService.checkPermission(parseInt(teacherId, 10), parseInt(classId, 10), action);
        return { hasPermission };
    }
    async getAccessibleClasses(teacherId) {
        const classes = await this.permissionsService.getAccessibleClasses(parseInt(teacherId, 10));
        return classes;
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)('teachers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getAllTeachersWithPermissions", null);
__decorate([
    (0, common_1.Get)('teachers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getTeacherPermissions", null);
__decorate([
    (0, common_1.Post)('teachers/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "setTeacherPermissions", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "updatePermission", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "removePermission", null);
__decorate([
    (0, common_1.Get)('check'),
    __param(0, (0, common_1.Query)('teacherId')),
    __param(1, (0, common_1.Query)('classId')),
    __param(2, (0, common_1.Query)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "checkPermission", null);
__decorate([
    (0, common_1.Get)('accessible-classes/:teacherId'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getAccessibleClasses", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, common_1.Controller)('permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map