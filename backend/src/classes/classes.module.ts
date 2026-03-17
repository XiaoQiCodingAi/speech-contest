import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Class } from '../entities/class.entity';
import { Student } from '../entities/student.entity';
import { TeacherPermission } from '../entities/teacher-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Class, Student, TeacherPermission])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
