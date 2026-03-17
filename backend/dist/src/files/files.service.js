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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("../entities/file.entity");
const user_entity_1 = require("../entities/user.entity");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const audit_log_entity_1 = require("../entities/audit-log.entity");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FilesService = class FilesService {
    fileRepository;
    userRepository;
    auditLogsService;
    uploadDir = path.join(process.cwd(), 'uploads');
    constructor(fileRepository, userRepository, auditLogsService) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.auditLogsService = auditLogsService;
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async upload(file, userId, entityType, entityId, description, folderId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        let fileType = file_entity_1.FileType.OTHER;
        if (file.mimetype.startsWith('image/')) {
            fileType = file_entity_1.FileType.IMAGE;
        }
        else if (file.mimetype.includes('pdf') ||
            file.mimetype.includes('document') ||
            file.mimetype.includes('text') ||
            file.mimetype.includes('sheet') ||
            file.mimetype.includes('presentation')) {
            fileType = file_entity_1.FileType.DOCUMENT;
        }
        const ext = path.extname(originalName);
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
        const filePath = path.join(this.uploadDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        const fileEntity = this.fileRepository.create({
            filename,
            originalName,
            mimeType: file.mimetype,
            size: file.size,
            path: filePath,
            type: fileType,
            entityType,
            entityId,
            description,
            folderId,
            uploadedBy: userId,
        });
        const savedFile = await this.fileRepository.save(fileEntity);
        await this.auditLogsService.log(audit_log_entity_1.AuditAction.CREATE, 'File', userId, '', savedFile.id, undefined, { filename: savedFile.filename, originalName: savedFile.originalName }, `上传文件: ${savedFile.originalName}`);
        return savedFile;
    }
    async download(id, userId) {
        const file = await this.fileRepository.findOne({
            where: { id },
            relations: ['uploader'],
        });
        if (!file) {
            throw new common_1.NotFoundException('文件不存在');
        }
        if (!fs.existsSync(file.path)) {
            throw new common_1.NotFoundException('文件已被删除');
        }
        const buffer = fs.readFileSync(file.path);
        await this.auditLogsService.log(audit_log_entity_1.AuditAction.READ, 'File', userId, '', file.id, undefined, undefined, `下载文件: ${file.originalName}`);
        return { file, buffer };
    }
    async findByEntity(entityType, entityId, folderId) {
        const where = { entityType, entityId };
        if (folderId !== undefined) {
            where.folderId = folderId;
        }
        return this.fileRepository.find({
            where,
            relations: ['uploader'],
            order: { createdAt: 'DESC' },
        });
    }
    async move(id, folderId) {
        const file = await this.fileRepository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException('文件不存在');
        }
        file.folderId = folderId;
        return this.fileRepository.save(file);
    }
    async findOne(id) {
        return this.fileRepository.findOne({
            where: { id },
            relations: ['uploader'],
        });
    }
    async findAll(query) {
        const page = query.page || 1;
        const pageSize = query.pageSize || 20;
        const skip = (page - 1) * pageSize;
        const qb = this.fileRepository
            .createQueryBuilder('file')
            .leftJoinAndSelect('file.uploader', 'uploader');
        if (query.type) {
            qb.andWhere('file.type = :type', { type: query.type });
        }
        if (query.entityType) {
            qb.andWhere('file.entityType = :entityType', { entityType: query.entityType });
        }
        if (query.entityId) {
            qb.andWhere('file.entityId = :entityId', { entityId: query.entityId });
        }
        qb.orderBy('file.createdAt', 'DESC')
            .skip(skip)
            .take(pageSize);
        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }
    async remove(id, userId) {
        const file = await this.fileRepository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.NotFoundException('文件不存在');
        }
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        await this.auditLogsService.log(audit_log_entity_1.AuditAction.DELETE, 'File', userId, '', file.id, { filename: file.filename, originalName: file.originalName }, undefined, `删除文件: ${file.originalName}`);
        await this.fileRepository.remove(file);
    }
    async getStats() {
        const files = await this.fileRepository.find();
        const byType = {};
        let totalSize = 0;
        files.forEach(file => {
            byType[file.type] = (byType[file.type] || 0) + 1;
            totalSize += file.size;
        });
        return {
            total: files.length,
            totalSize,
            byType,
        };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_logs_service_1.AuditLogsService])
], FilesService);
//# sourceMappingURL=files.service.js.map