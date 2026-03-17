import { ClassesService, CreateClassDto, UpdateClassDto } from './classes.service';
import { Repository } from 'typeorm';
import { TeacherPermission } from '../entities/teacher-permission.entity';
export declare class ClassesController {
    private readonly classesService;
    private permissionRepository;
    constructor(classesService: ClassesService, permissionRepository: Repository<TeacherPermission>);
    create(createClassDto: CreateClassDto): Promise<import("../entities").Class>;
    findAll(page?: string, pageSize?: string, isActive?: string, keyword?: string): Promise<{
        data: import("../entities").Class[];
        total: number;
    }>;
    getAll(req: any): Promise<import("../entities").Class[]>;
    findOne(id: number): Promise<import("../entities").Class>;
    update(id: number, updateClassDto: UpdateClassDto): Promise<import("../entities").Class>;
    remove(id: number): Promise<void>;
}
