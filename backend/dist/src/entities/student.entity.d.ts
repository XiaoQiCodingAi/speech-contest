import { Class } from './class.entity';
import { User } from './user.entity';
export declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
export declare class Student {
    id: number;
    studentNo: string;
    name: string;
    gender: Gender;
    birthDate: Date;
    phone: string;
    parentPhone: string;
    address: string;
    remarks: string;
    isActive: boolean;
    class: Class;
    classId: number;
    creator: User;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
}
