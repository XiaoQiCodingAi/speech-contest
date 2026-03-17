import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
export declare class AuditLogsService {
    private auditLogsRepository;
    constructor(auditLogsRepository: Repository<AuditLog>);
    log(action: AuditAction, entityType: string, userId: number, ip: string, entityId?: number, oldValue?: Record<string, any>, newValue?: Record<string, any>, description?: string): Promise<AuditLog>;
    findAll(page?: number, pageSize?: number, userId?: number, action?: AuditAction, entityType?: string, startDate?: Date, endDate?: Date): Promise<{
        data: AuditLog[];
        total: number;
    }>;
    findOne(id: number): Promise<AuditLog | null>;
    getUserRecentActions(userId: number, limit?: number): Promise<AuditLog[]>;
}
