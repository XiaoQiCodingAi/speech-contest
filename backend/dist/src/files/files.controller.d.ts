import type { Response } from 'express';
import { FilesService } from './files.service';
import { FileType, FileEntityType } from '../entities/file.entity';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    upload(file: Express.Multer.File, req: any, body: any): Promise<{
        error: string;
        id?: undefined;
        filename?: undefined;
        originalName?: undefined;
        mimeType?: undefined;
        size?: undefined;
        type?: undefined;
        createdAt?: undefined;
    } | {
        id: number;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        type: FileType;
        createdAt: Date;
        error?: undefined;
    }>;
    download(id: string, token: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    preview(id: string, token: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private extractUserIdFromToken;
    findByEntity(type: FileEntityType, id: string, folderId?: string): Promise<{
        id: number;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        type: FileType;
        description: string;
        folderId: number;
        createdAt: Date;
        uploader: {
            id: number;
            name: string;
        } | null;
    }[]>;
    findAll(page?: string, pageSize?: string, type?: FileType, entityType?: FileEntityType, entityId?: string): Promise<{
        data: {
            id: number;
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            type: FileType;
            entityType: FileEntityType;
            entityId: number;
            description: string;
            createdAt: Date;
            uploader: {
                id: number;
                name: string;
            } | null;
        }[];
        total: number;
    }>;
    getStats(): Promise<{
        total: number;
        totalSize: number;
        byType: Record<string, number>;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
    move(id: string, body: {
        folderId: number | null;
    }): Promise<import("../entities/file.entity").File>;
}
