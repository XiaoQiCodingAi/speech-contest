import { User } from './user.entity';
export declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
export declare enum TeacherStatus {
    ACTIVE = "active",
    ON_LEAVE = "on_leave",
    RESIGNED = "resigned"
}
export declare class Teacher {
    id: number;
    employeeNo: string;
    name: string;
    gender: Gender;
    birthDate: Date;
    phone: string;
    email: string;
    department: string;
    position: string;
    status: TeacherStatus;
    joinDate: Date;
    remarks: string;
    user: User;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}
