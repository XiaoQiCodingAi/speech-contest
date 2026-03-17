import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsEmail } from 'class-validator';
import { Gender, TeacherStatus } from '../entities/teacher.entity';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty({ message: '工号不能为空' })
  employeeNo: string;

  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  name: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsEnum(TeacherStatus)
  status?: TeacherStatus;

  @IsOptional()
  @IsDateString()
  joinDate?: Date;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '工号不能为空' })
  employeeNo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  name?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsEnum(TeacherStatus)
  status?: TeacherStatus;

  @IsOptional()
  @IsDateString()
  joinDate?: Date;

  @IsOptional()
  @IsString()
  remarks?: string;
}
