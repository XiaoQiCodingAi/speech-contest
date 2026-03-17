import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeacherPermission } from '../entities/teacher-permission.entity';
export declare class TeacherScopeGuard implements CanActivate {
    private permissionRepository;
    constructor(permissionRepository: Repository<TeacherPermission>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
