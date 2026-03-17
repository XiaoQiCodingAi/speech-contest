import { Repository } from 'typeorm';
import { Teacher, TeacherStatus } from '../entities/teacher.entity';
import { User } from '../entities/user.entity';
import { CreateTeacherDto, UpdateTeacherDto } from './teachers.dto';
export declare class TeachersService {
    private teachersRepository;
    private userRepository;
    constructor(teachersRepository: Repository<Teacher>, userRepository: Repository<User>);
    create(createTeacherDto: CreateTeacherDto): Promise<Teacher>;
    findAll(page?: number, pageSize?: number, status?: TeacherStatus, department?: string, keyword?: string): Promise<{
        data: Teacher[];
        total: number;
    }>;
    findOne(id: number): Promise<Teacher>;
    update(id: number, updateTeacherDto: UpdateTeacherDto): Promise<Teacher>;
    remove(id: number): Promise<void>;
    resetPassword(id: number): Promise<void>;
    getStats(): Promise<any>;
}
