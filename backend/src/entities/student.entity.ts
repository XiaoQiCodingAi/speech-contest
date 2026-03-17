import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { User } from './user.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentNo: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  parentPhone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, type: 'text' })
  remarks: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Class, (cls) => cls.students)
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: number;

  @ManyToOne(() => User, (user) => user.students)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
