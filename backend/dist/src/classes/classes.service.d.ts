import { Repository } from 'typeorm';
import { Class } from '../entities/class.entity';
import { Student } from '../entities/student.entity';
export declare class ClassesService {
    private classesRepository;
    private studentsRepository;
    constructor(classesRepository: Repository<Class>, studentsRepository: Repository<Student>);
    create(createClassDto: CreateClassDto): Promise<Class>;
    findAll(page?: number, pageSize?: number, isActive?: boolean, keyword?: string): Promise<{
        data: Class[];
        total: number;
    }>;
    findOne(id: number): Promise<Class>;
    update(id: number, updateClassDto: UpdateClassDto): Promise<Class>;
    remove(id: number): Promise<void>;
    getAll(): Promise<Class[]>;
}
export declare class CreateClassDto {
    name: string;
    grade?: string;
    year?: number;
    description?: string;
}
export declare class UpdateClassDto {
    name?: string;
    grade?: string;
    year?: number;
    description?: string;
    isActive?: boolean;
}
