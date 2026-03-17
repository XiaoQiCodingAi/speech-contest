import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { AuditLog } from './audit-log.entity';
import { TeacherPermission } from './teacher-permission.entity';

export enum UserRole {
  ADMIN = 'admin',
  LEADER = 'leader',
  TEACHER = 'teacher',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TEACHER,
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Student, (student) => student.creator)
  students: Student[];

  @OneToMany(() => Teacher, (teacher) => teacher.user)
  teacherProfile: Teacher[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];

  @OneToMany(() => TeacherPermission, (permission) => permission.teacher)
  permissions: TeacherPermission[];
}
