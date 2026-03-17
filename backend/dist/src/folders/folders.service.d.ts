import { Repository } from 'typeorm';
import { Folder } from '../entities/folder.entity';
import { User } from '../entities/user.entity';
export declare class FoldersService {
    private folderRepository;
    private userRepository;
    constructor(folderRepository: Repository<Folder>, userRepository: Repository<User>);
    create(name: string, entityType: 'student' | 'teacher', entityId: number, userId: number, parentId?: number): Promise<Folder>;
    findByEntity(entityType: 'student' | 'teacher', entityId: number): Promise<Folder[]>;
    findAll(entityType: 'student' | 'teacher', entityId: number): Promise<Folder[]>;
    rename(id: number, name: string): Promise<Folder>;
    move(id: number, parentId: number | null): Promise<Folder>;
    remove(id: number): Promise<void>;
}
