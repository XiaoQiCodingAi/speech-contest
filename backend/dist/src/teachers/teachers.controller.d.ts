import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './teachers.dto';
import { TeacherStatus } from '../entities/teacher.entity';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    create(createTeacherDto: CreateTeacherDto): Promise<import("../entities/teacher.entity").Teacher>;
    findAll(page?: string, pageSize?: string, status?: TeacherStatus, department?: string, keyword?: string): Promise<{
        data: import("../entities/teacher.entity").Teacher[];
        total: number;
    }>;
    getStats(): Promise<any>;
    findOne(id: number): Promise<import("../entities/teacher.entity").Teacher>;
    update(id: number, updateTeacherDto: UpdateTeacherDto): Promise<import("../entities/teacher.entity").Teacher>;
    remove(id: number): Promise<void>;
    resetPassword(id: number): Promise<void>;
}
