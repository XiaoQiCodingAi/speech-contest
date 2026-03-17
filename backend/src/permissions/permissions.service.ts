import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TeacherPermission } from '../entities/teacher-permission.entity';
import { User, UserRole } from '../entities/user.entity';
import { Class } from '../entities/class.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../entities/audit-log.entity';

export interface TeacherWithPermissions {
  id: number;
  name: string;
  username: string;
  permissions: {
    classId: number;
    className: string;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }[];
}

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(TeacherPermission)
    private permissionRepository: Repository<TeacherPermission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    private auditLogsService: AuditLogsService,
  ) {}

  async getTeacherPermissions(teacherId: number) {
    const teacher = await this.userRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException('教师不存在');
    }

    const permissions = await this.permissionRepository.find({
      where: { teacherId },
      relations: ['class', 'grantedBy'],
    });

    return permissions.map(p => ({
      id: p.id,
      classId: p.classId,
      className: p.class?.name,
      canView: p.canView,
      canEdit: p.canEdit,
      canDelete: p.canDelete,
      grantedBy: p.grantedBy?.name,
      createdAt: p.createdAt,
    }));
  }

  async getAllTeachersWithPermissions(): Promise<TeacherWithPermissions[]> {
    const teachers = await this.userRepository.find({
      where: { role: UserRole.TEACHER },
      order: { name: 'ASC' },
    });

    const result: TeacherWithPermissions[] = [];
    for (const teacher of teachers) {
      const permissions = await this.permissionRepository.find({
        where: { teacherId: teacher.id },
        relations: ['class'],
      });

      result.push({
        id: teacher.id,
        name: teacher.name,
        username: teacher.username,
        permissions: permissions.map(p => ({
          classId: p.classId,
          className: p.class?.name || '',
          canView: p.canView,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
        })),
      });
    }

    return result;
  }

  async setTeacherPermissions(
    teacherId: number,
    classIds: number[],
    grantedById: number,
    permissions: { canView?: boolean; canEdit?: boolean; canDelete?: boolean } = {},
  ) {
    const teacher = await this.userRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException('教师不存在');
    }

    if (teacher.role !== UserRole.TEACHER) {
      throw new BadRequestException('只能为教师角色配置权限');
    }

    // 删除旧的权限
    await this.permissionRepository.delete({ teacherId });

    // 创建新的权限
    const newPermissions: TeacherPermission[] = [];
    for (const classId of classIds) {
      const cls = await this.classRepository.findOne({ where: { id: classId } });
      if (!cls) continue;

      const permission = this.permissionRepository.create({
        teacherId,
        classId,
        canView: permissions.canView ?? true,
        canEdit: permissions.canEdit ?? false,
        canDelete: permissions.canDelete ?? false,
        grantedById,
      });
      newPermissions.push(permission);
    }

    const saved = await this.permissionRepository.save(newPermissions);

    // 记录操作日志
    await this.auditLogsService.log(
      AuditAction.UPDATE,
      'TeacherPermission',
      grantedById,
      '',
      teacherId,
      undefined,
      { classIds, permissions },
      `更新教师权限: ${teacher.name}`,
    );

    return saved;
  }

  async updatePermission(
    permissionId: number,
    updates: { canView?: boolean; canEdit?: boolean; canDelete?: boolean },
    userId: number,
  ) {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
      relations: ['teacher', 'class'],
    });

    if (!permission) {
      throw new NotFoundException('权限记录不存在');
    }

    Object.assign(permission, updates);
    const saved = await this.permissionRepository.save(permission);

    // 记录操作日志
    await this.auditLogsService.log(
      AuditAction.UPDATE,
      'TeacherPermission',
      userId,
      '',
      permissionId,
      undefined,
      updates,
      `更新权限: ${permission.teacher?.name} 对 ${permission.class?.name}`,
    );

    return saved;
  }

  async removePermission(permissionId: number, userId: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
      relations: ['teacher', 'class'],
    });

    if (!permission) {
      throw new NotFoundException('权限记录不存在');
    }

    await this.permissionRepository.remove(permission);

    // 记录操作日志
    await this.auditLogsService.log(
      AuditAction.DELETE,
      'TeacherPermission',
      userId,
      '',
      permissionId,
      undefined,
      undefined,
      `删除权限: ${permission.teacher?.name} 对 ${permission.class?.name}`,
    );
  }

  async checkPermission(
    teacherId: number,
    classId: number,
    action: 'view' | 'edit' | 'delete',
  ): Promise<boolean> {
    const permission = await this.permissionRepository.findOne({
      where: { teacherId, classId },
    });

    if (!permission) return false;

    switch (action) {
      case 'view':
        return permission.canView;
      case 'edit':
        return permission.canEdit;
      case 'delete':
        return permission.canDelete;
      default:
        return false;
    }
  }

  async getAccessibleClasses(teacherId: number) {
    const permissions = await this.permissionRepository.find({
      where: { teacherId, canView: true },
      relations: ['class'],
    });

    return permissions.map(p => p.class).filter(Boolean);
  }
}
