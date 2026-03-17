import { Student } from './student.entity';
import { TeacherPermission } from './teacher-permission.entity';
export declare class Class {
    id: number;
    name: string;
    grade: string;
    year: number;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    students: Student[];
    permissions: TeacherPermission[];
}
