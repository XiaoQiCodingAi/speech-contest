import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
export declare class AuthService {
    private jwtService;
    private usersRepository;
    private tokenBlacklist;
    constructor(jwtService: JwtService, usersRepository: Repository<User>);
    validateUser(username: string, password: string): Promise<any>;
    login(username: string, password: string, ip: string): Promise<{
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
    logout(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    isTokenBlacklisted(token: string): boolean;
    private cleanupExpiredTokens;
    register(username: string, password: string, name: string, role?: UserRole): Promise<{
        success: boolean;
        message: string;
        user: {
            id: number;
            username: string;
            name: string;
            role: UserRole;
        };
    }>;
    getProfile(userId: number): Promise<{
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
    changePassword(userId: number, oldPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
