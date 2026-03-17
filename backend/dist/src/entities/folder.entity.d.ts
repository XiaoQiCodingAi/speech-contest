import { User } from './user.entity';
export declare class Folder {
    id: number;
    name: string;
    parentId: number;
    parent: Folder;
    children: Folder[];
    entityType: 'student' | 'teacher' | 'class';
    entityId: number;
    creator: User;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
}
