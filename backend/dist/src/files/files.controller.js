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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const public_decorator_1 = require("../auth/public.decorator");
const user_entity_1 = require("../entities/user.entity");
const file_entity_1 = require("../entities/file.entity");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    async upload(file, req, body) {
        if (!file) {
            return { error: '请选择文件' };
        }
        const entityType = body.entityType;
        const entityId = body.entityId ? parseInt(body.entityId, 10) : undefined;
        const folderId = body.folderId ? parseInt(body.folderId, 10) : undefined;
        const uploadedFile = await this.filesService.upload(file, req.user.userId, entityType, entityId, body.description, folderId);
        return {
            id: uploadedFile.id,
            filename: uploadedFile.filename,
            originalName: uploadedFile.originalName,
            mimeType: uploadedFile.mimeType,
            size: uploadedFile.size,
            type: uploadedFile.type,
            createdAt: uploadedFile.createdAt,
        };
    }
    async download(id, token, res) {
        if (!token) {
            return res.status(401).json({ error: '未授权' });
        }
        const userId = this.extractUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({ error: '无效的token' });
        }
        const idNum = parseInt(id, 10);
        const { file, buffer } = await this.filesService.download(idNum, userId);
        const encodedFilename = encodeURIComponent(file.originalName);
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
        res.send(buffer);
    }
    async preview(id, token, res) {
        if (!token) {
            return res.status(401).json({ error: '未授权' });
        }
        const userId = this.extractUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({ error: '无效的token' });
        }
        const idNum = parseInt(id, 10);
        const { file, buffer } = await this.filesService.download(idNum, userId);
        if (!file.mimeType.startsWith('image/') && file.mimeType !== 'application/pdf') {
            return res.status(400).json({ error: '只支持预览图片和PDF文件' });
        }
        const disposition = file.mimeType === 'application/pdf' ? 'inline' : 'attachment';
        const encodedFilename = encodeURIComponent(file.originalName);
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${encodedFilename}`);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
    }
    extractUserIdFromToken(token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, 'school-archive-secret-key-change-in-production');
            return decoded.sub;
        }
        catch (error) {
            return null;
        }
    }
    async findByEntity(type, id, folderId) {
        const idNum = parseInt(id, 10);
        const folderIdNum = folderId ? parseInt(folderId, 10) : undefined;
        const files = await this.filesService.findByEntity(type, idNum, folderIdNum);
        return files.map(f => ({
            id: f.id,
            filename: f.filename,
            originalName: f.originalName,
            mimeType: f.mimeType,
            size: f.size,
            type: f.type,
            description: f.description,
            folderId: f.folderId,
            createdAt: f.createdAt,
            uploader: f.uploader ? { id: f.uploader.id, name: f.uploader.name } : null,
        }));
    }
    async findAll(page, pageSize, type, entityType, entityId) {
        const result = await this.filesService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
            type,
            entityType,
            entityId: entityId ? parseInt(entityId, 10) : undefined,
        });
        return {
            data: result.data.map(f => ({
                id: f.id,
                filename: f.filename,
                originalName: f.originalName,
                mimeType: f.mimeType,
                size: f.size,
                type: f.type,
                entityType: f.entityType,
                entityId: f.entityId,
                description: f.description,
                createdAt: f.createdAt,
                uploader: f.uploader ? { id: f.uploader.id, name: f.uploader.name } : null,
            })),
            total: result.total,
        };
    }
    async getStats() {
        return this.filesService.getStats();
    }
    async remove(id, req) {
        const idNum = parseInt(id, 10);
        const file = await this.filesService.findOne(idNum);
        if (!file) {
            throw new common_1.NotFoundException('文件不存在');
        }
        const isAdminOrLeader = req.user.role === 'admin' || req.user.role === 'leader';
        const isOwner = file.uploadedBy === req.user.userId;
        if (!isAdminOrLeader && !isOwner) {
            throw new common_1.ForbiddenException('无权删除此文件');
        }
        await this.filesService.remove(idNum, req.user.userId);
        return { success: true };
    }
    async move(id, body) {
        const idNum = parseInt(id, 10);
        return this.filesService.move(idNum, body.folderId);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.LEADER, user_entity_1.UserRole.TEACHER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('download/:id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "download", null);
__decorate([
    (0, common_1.Get)('preview/:id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "preview", null);
__decorate([
    (0, common_1.Get)('entity/:type/:id'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "findByEntity", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.LEADER),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('entityType')),
    __param(4, (0, common_1.Query)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.LEADER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/move'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "move", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map