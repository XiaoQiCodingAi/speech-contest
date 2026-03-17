import { Gender, TeacherStatus } from '../entities/teacher.entity';
export declare class CreateTeacherDto {
    employeeNo: string;
    name: string;
    gender?: Gender;
    birthDate?: Date;
    phone?: string;
    email?: string;
    department?: string;
    position?: string;
    status?: TeacherStatus;
    joinDate?: Date;
    remarks?: string;
}
export declare class UpdateTeacherDto {
    employeeNo?: string;
    name?: string;
    gender?: Gender;
    birthDate?: Date;
    phone?: string;
    email?: string;
    department?: string;
    position?: string;
    status?: TeacherStatus;
    joinDate?: Date;
    remarks?: string;
}
