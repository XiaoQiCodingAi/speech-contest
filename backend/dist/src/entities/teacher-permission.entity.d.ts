import { User } from './user.entity';
import { Class } from './class.entity';
export declare class TeacherPermission {
    id: number;
    teacher: User;
    teacherId: number;
    class: Class;
    classId: number;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    grantedById: number;
    grantedBy: User;
    createdAt: Date;
    updatedAt: Date;
}
