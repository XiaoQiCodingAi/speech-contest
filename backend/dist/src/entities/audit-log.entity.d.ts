import { User } from './user.entity';
export declare enum AuditAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    LOGIN = "login",
    LOGOUT = "logout"
}
export declare class AuditLog {
    id: number;
    action: AuditAction;
    entityType: string;
    entityId: number;
    oldValue: Record<string, any>;
    newValue: Record<string, any>;
    description: string;
    ip: string;
    user: User;
    userId: number;
    createdAt: Date;
}
