import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { UserRole } from '../entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, req: any): Promise<import("../entities/user.entity").User>;
    findAll(page?: string, pageSize?: string, role?: UserRole, isActive?: string, keyword?: string): Promise<{
        data: import("../entities/user.entity").User[];
        total: number;
    }>;
    findOne(id: number): Promise<import("../entities/user.entity").User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<import("../entities/user.entity").User>;
    remove(id: number): Promise<void>;
    updatePassword(id: number, body: {
        oldPassword: string;
        newPassword: string;
    }): Promise<void>;
    resetPassword(id: number, body: {
        newPassword: string;
    }): Promise<void>;
}
