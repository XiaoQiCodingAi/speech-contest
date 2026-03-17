import { FoldersService } from './folders.service';
export declare class FoldersController {
    private readonly foldersService;
    constructor(foldersService: FoldersService);
    create(body: {
        name: string;
        entityType: 'student' | 'teacher';
        entityId: number;
        parentId?: number;
    }, req: any): Promise<import("../entities").Folder>;
    findAll(entityType: 'student' | 'teacher', entityId: string): Promise<import("../entities").Folder[]>;
    getTree(entityType: 'student' | 'teacher', entityId: string): Promise<import("../entities").Folder[]>;
    rename(id: string, body: {
        name: string;
    }): Promise<import("../entities").Folder>;
    move(id: string, body: {
        parentId: number | null;
    }): Promise<import("../entities").Folder>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
