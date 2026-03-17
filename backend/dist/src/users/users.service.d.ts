import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(page?: number, pageSize?: number, role?: UserRole, isActive?: boolean, keyword?: string): Promise<{
        data: User[];
        total: number;
    }>;
    findOne(id: number): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: number): Promise<void>;
    updatePassword(id: number, oldPassword: string, newPassword: string): Promise<void>;
    resetPassword(id: number, newPassword: string): Promise<void>;
}
export declare class CreateUserDto {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
    email?: string;
}
export declare class UpdateUserDto {
    username?: string;
    password?: string;
    name?: string;
    role?: UserRole;
    phone?: string;
    email?: string;
    isActive?: boolean;
}
