import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('teachers')
  async getAllTeachersWithPermissions() {
    return this.permissionsService.getAllTeachersWithPermissions();
  }

  @Get('teachers/:id')
  async getTeacherPermissions(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.permissionsService.getTeacherPermissions(idNum);
  }

  @Post('teachers/:id')
  async setTeacherPermissions(
    @Param('id') id: string,
    @Body() body: { classIds: number[]; canView?: boolean; canEdit?: boolean; canDelete?: boolean },
    @Req() req: any,
  ) {
    const idNum = parseInt(id, 10);
    return this.permissionsService.setTeacherPermissions(
      idNum,
      body.classIds,
      req.user.userId,
      {
        canView: body.canView,
        canEdit: body.canEdit,
        canDelete: body.canDelete,
      },
    );
  }

  @Put(':id')
  async updatePermission(
    @Param('id') id: string,
    @Body() body: { canView?: boolean; canEdit?: boolean; canDelete?: boolean },
    @Req() req: any,
  ) {
    const idNum = parseInt(id, 10);
    return this.permissionsService.updatePermission(idNum, body, req.user.userId);
  }

  @Delete(':id')
  async removePermission(@Param('id') id: string, @Req() req: any) {
    const idNum = parseInt(id, 10);
    await this.permissionsService.removePermission(idNum, req.user.userId);
    return { success: true };
  }

  @Get('check')
  async checkPermission(
    @Query('teacherId') teacherId: string,
    @Query('classId') classId: string,
    @Query('action') action: 'view' | 'edit' | 'delete',
  ) {
    const hasPermission = await this.permissionsService.checkPermission(
      parseInt(teacherId, 10),
      parseInt(classId, 10),
      action,
    );
    return { hasPermission };
  }

  @Get('accessible-classes/:teacherId')
  async getAccessibleClasses(@Param('teacherId') teacherId: string) {
    const classes = await this.permissionsService.getAccessibleClasses(parseInt(teacherId, 10));
    return classes;
  }
}
