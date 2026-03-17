import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/user.entity';
import { TeacherPermission } from '../entities/teacher-permission.entity';

@Injectable()
export class TeacherScopeGuard implements CanActivate {
  constructor(
    @InjectRepository(TeacherPermission)
    private permissionRepository: Repository<TeacherPermission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未登录');
    }

    // 管理员和领导可以访问所有数据
    if (user.role === UserRole.ADMIN || user.role === UserRole.LEADER) {
      request.allowedClassIds = null; // null 表示不限制
      return true;
    }

    // 教师只能访问自己有权限的班级数据
    if (user.role === UserRole.TEACHER) {
      const permissions = await this.permissionRepository.find({
        where: { teacherId: user.userId, canView: true },
        select: ['classId'],
      });

      if (permissions.length === 0) {
        // 如果教师没有任何权限，返回空数组，这样查询结果会是空的
        request.allowedClassIds = [];
        return true;
      }

      request.allowedClassIds = permissions.map((p) => p.classId);
      return true;
    }

    throw new ForbiddenException('没有权限执行此操作');
  }
}
