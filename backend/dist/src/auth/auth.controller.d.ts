import { AuthService } from './auth.service';
import { UserRole } from '../entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        username: string;
        password: string;
    }, ip: string): Promise<{
        success: boolean;
        message: string;
        token: string;
        user: {
            id: any;
            username: any;
            name: any;
            role: any;
            phone: any;
            email: any;
        };
    }>;
    logout(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    register(body: {
        username: string;
        password: string;
        name: string;
        role?: UserRole;
    }): Promise<{
        success: boolean;
        message: string;
        user: {
            id: number;
            username: string;
            name: string;
            role: UserRole;
        };
    }>;
    getProfile(req: any): Promise<{
        id: number;
        username: string;
        name: string;
        role: UserRole;
        phone: string;
        email: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        students: import("../entities").Student[];
        teacherProfile: import("../entities").Teacher[];
        auditLogs: import("../entities").AuditLog[];
        permissions: import("../entities").TeacherPermission[];
    }>;
    changePassword(req: any, body: {
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
