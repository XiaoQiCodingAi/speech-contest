import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PdfExportService } from './pdf-export.service';
import { Student } from '../entities/student.entity';
import { Class } from '../entities/class.entity';
import { User } from '../entities/user.entity';
import { TeacherPermission } from '../entities/teacher-permission.entity';
import { File } from '../entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Class, User, TeacherPermission, File])],
  controllers: [StudentsController],
  providers: [StudentsService, PdfExportService],
  exports: [StudentsService, PdfExportService],
})
export class StudentsModule {}
