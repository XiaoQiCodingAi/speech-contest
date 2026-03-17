import type { Response } from 'express';
import { StudentsService, CreateStudentDto, UpdateStudentDto } from './students.service';
import { PdfExportService } from './pdf-export.service';
import { Gender } from '../entities/student.entity';
import { Repository } from 'typeorm';
import { TeacherPermission } from '../entities/teacher-permission.entity';
import { File } from '../entities/file.entity';
export declare class StudentsController {
    private readonly studentsService;
    private readonly pdfExportService;
    private permissionRepository;
    private fileRepository;
    constructor(studentsService: StudentsService, pdfExportService: PdfExportService, permissionRepository: Repository<TeacherPermission>, fileRepository: Repository<File>);
    create(createStudentDto: CreateStudentDto, req: any): Promise<import("../entities/student.entity").Student>;
    findAll(page?: string, pageSize?: string, classId?: string, gender?: Gender, isActive?: string, keyword?: string, req?: any): Promise<{
        data: import("../entities/student.entity").Student[];
        total: number;
    }>;
    getStats(req: any): Promise<any>;
    findOne(id: number, req: any): Promise<import("../entities/student.entity").Student>;
    update(id: number, updateStudentDto: UpdateStudentDto, req: any): Promise<import("../entities/student.entity").Student>;
    remove(id: number): Promise<void>;
    exportPdf(id: number, req: any, res: Response): Promise<void>;
}
