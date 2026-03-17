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
exports.FoldersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const folder_entity_1 = require("../entities/folder.entity");
const user_entity_1 = require("../entities/user.entity");
let FoldersService = class FoldersService {
    folderRepository;
    userRepository;
    constructor(folderRepository, userRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }
    async create(name, entityType, entityId, userId, parentId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const folder = this.folderRepository.create({
            name,
            entityType,
            entityId,
            createdBy: userId,
            parentId,
        });
        return this.folderRepository.save(folder);
    }
    async findByEntity(entityType, entityId) {
        return this.folderRepository.find({
            where: { entityType, entityId, parentId: (0, typeorm_2.IsNull)() },
            relations: ['children'],
            order: { createdAt: 'ASC' },
        });
    }
    async findAll(entityType, entityId) {
        return this.folderRepository.find({
            where: { entityType, entityId },
            order: { createdAt: 'ASC' },
        });
    }
    async rename(id, name) {
        const folder = await this.folderRepository.findOne({ where: { id } });
        if (!folder) {
            throw new common_1.NotFoundException('文件夹不存在');
        }
        folder.name = name;
        return this.folderRepository.save(folder);
    }
    async move(id, parentId) {
        const folder = await this.folderRepository.findOne({ where: { id } });
        if (!folder) {
            throw new common_1.NotFoundException('文件夹不存在');
        }
        if (parentId === id) {
            throw new Error('不能移动到自身');
        }
        folder.parentId = parentId;
        return this.folderRepository.save(folder);
    }
    async remove(id) {
        const folder = await this.folderRepository.findOne({
            where: { id },
            relations: ['children'],
        });
        if (!folder) {
            throw new common_1.NotFoundException('文件夹不存在');
        }
        if (folder.children && folder.children.length > 0) {
            for (const child of folder.children) {
                await this.remove(child.id);
            }
        }
        await this.folderRepository.remove(folder);
    }
};
exports.FoldersService = FoldersService;
exports.FoldersService = FoldersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(folder_entity_1.Folder)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FoldersService);
//# sourceMappingURL=folders.service.js.map