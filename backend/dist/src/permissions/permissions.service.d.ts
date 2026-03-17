import { Repository } from 'typeorm';
import { TeacherPermission } from '../entities/teacher-permission.entity';
import { User } from '../entities/user.entity';
import { Class } from '../entities/class.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export interface TeacherWithPermissions {
    id: number;
    name: string;
    username: string;
    permissions: {
        classId: number;
        className: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
    }[];
}
export declare class PermissionsService {
    private permissionRepository;
    private userRepository;
    private classRepository;
    private auditLogsService;
    constructor(permissionRepository: Repository<TeacherPermission>, userRepository: Repository<User>, classRepository: Repository<Class>, auditLogsService: AuditLogsService);
    getTeacherPermissions(teacherId: number): Promise<{
        id: number;
        classId: number;
        className: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        grantedBy: string;
        createdAt: Date;
    }[]>;
    getAllTeachersWithPermissions(): Promise<TeacherWithPermissions[]>;
    setTeacherPermissions(teacherId: number, classIds: number[], grantedById: number, permissions?: {
        canView?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
    }): Promise<TeacherPermission[]>;
    updatePermission(permissionId: number, updates: {
        canView?: boolean;
        canEdit?: boolean;
        canDelete?: boolean;
    }, userId: number): Promise<TeacherPermission>;
    removePermission(permissionId: number, userId: number): Promise<void>;
    checkPermission(teacherId: number, classId: number, action: 'view' | 'edit' | 'delete'): Promise<boolean>;
    getAccessibleClasses(teacherId: number): Promise<Class[]>;
}
