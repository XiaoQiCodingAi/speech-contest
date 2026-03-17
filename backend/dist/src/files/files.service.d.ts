import { Repository } from 'typeorm';
import { File, FileType, FileEntityType } from '../entities/file.entity';
import { User } from '../entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export declare class FilesService {
    private fileRepository;
    private userRepository;
    private auditLogsService;
    private uploadDir;
    constructor(fileRepository: Repository<File>, userRepository: Repository<User>, auditLogsService: AuditLogsService);
    upload(file: Express.Multer.File, userId: number, entityType?: FileEntityType, entityId?: number, description?: string, folderId?: number): Promise<File>;
    download(id: number, userId: number): Promise<{
        file: File;
        buffer: Buffer;
    }>;
    findByEntity(entityType: FileEntityType, entityId: number, folderId?: number): Promise<File[]>;
    move(id: number, folderId: number | null): Promise<File>;
    findOne(id: number): Promise<File | null>;
    findAll(query: {
        page?: number;
        pageSize?: number;
        type?: FileType;
        entityType?: FileEntityType;
        entityId?: number;
    }): Promise<{
        data: File[];
        total: number;
    }>;
    remove(id: number, userId: number): Promise<void>;
    getStats(): Promise<{
        total: number;
        totalSize: number;
        byType: Record<string, number>;
    }>;
}
