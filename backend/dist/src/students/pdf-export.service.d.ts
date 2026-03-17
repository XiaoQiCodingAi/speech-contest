import { Student } from '../entities/student.entity';
import { File } from '../entities/file.entity';
export declare class PdfExportService {
    exportStudentProfile(student: Student, files: File[]): Promise<Buffer>;
    private formatFileSize;
}
