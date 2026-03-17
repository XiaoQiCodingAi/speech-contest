import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { AuditLog } from './audit-log.entity';
import { TeacherPermission } from './teacher-permission.entity';
export declare enum UserRole {
    ADMIN = "admin",
    LEADER = "leader",
    TEACHER = "teacher"
}
export declare class User {
    id: number;
    username: string;
    password: string;
    name: string;
    role: UserRole;
    phone: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    students: Student[];
    teacherProfile: Teacher[];
    auditLogs: AuditLog[];
    permissions: TeacherPermission[];
}
