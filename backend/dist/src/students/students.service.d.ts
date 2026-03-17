import { Repository } from 'typeorm';
import { Student, Gender } from '../entities/student.entity';
import { Class } from '../entities/class.entity';
import { User } from '../entities/user.entity';
export declare class StudentsService {
    private studentsRepository;
    private classRepository;
    private userRepository;
    constructor(studentsRepository: Repository<Student>, classRepository: Repository<Class>, userRepository: Repository<User>);
    create(createStudentDto: CreateStudentDto, userId: number): Promise<Student>;
    findAll(page?: number, pageSize?: number, classId?: number, gender?: Gender, isActive?: boolean, keyword?: string, allowedClassIds?: number[]): Promise<{
        data: Student[];
        total: number;
    }>;
    findOne(id: number): Promise<Student>;
    update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student>;
    remove(id: number): Promise<void>;
    getStats(allowedClassIds?: number[] | null): Promise<any>;
}
export declare class CreateStudentDto {
    studentNo: string;
    name: string;
    gender?: Gender;
    birthDate?: string;
    phone?: string;
    parentPhone?: string;
    address?: string;
    remarks?: string;
    classId: number;
}
export declare class UpdateStudentDto {
    studentNo?: string;
    name?: string;
    gender?: Gender;
    birthDate?: string;
    phone?: string;
    parentPhone?: string;
    address?: string;
    remarks?: string;
    classId?: number;
    isActive?: boolean;
}
