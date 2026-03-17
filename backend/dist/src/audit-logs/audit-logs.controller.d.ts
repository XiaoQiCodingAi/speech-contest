import { AuditLogsService } from './audit-logs.service';
import { AuditAction } from '../entities/audit-log.entity';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    findAll(page?: string, pageSize?: string, userId?: string, action?: AuditAction, entityType?: string, startDate?: string, endDate?: string): Promise<{
        data: import("../entities/audit-log.entity").AuditLog[];
        total: number;
    }>;
    findOne(id: number): Promise<import("../entities/audit-log.entity").AuditLog | null>;
}
