import { User } from './user.entity';
export declare enum FileType {
    IMAGE = "image",
    DOCUMENT = "document",
    OTHER = "other"
}
export declare enum FileEntityType {
    STUDENT = "student",
    TEACHER = "teacher",
    CLASS = "class"
}
export declare class File {
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    type: FileType;
    entityType: FileEntityType;
    entityId: number;
    description: string;
    folderId: number;
    uploader: User;
    uploadedBy: number;
    createdAt: Date;
    updatedAt: Date;
}
