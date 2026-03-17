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
import { FoldersService } from './folders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('folders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LEADER, UserRole.TEACHER)
  async create(
    @Body() body: { name: string; entityType: 'student' | 'teacher'; entityId: number; parentId?: number },
    @Req() req: any,
  ) {
    return this.foldersService.create(
      body.name,
      body.entityType,
      body.entityId,
      req.user.userId,
      body.parentId,
    );
  }

  @Get()
  async findAll(
    @Query('entityType') entityType: 'student' | 'teacher',
    @Query('entityId') entityId: string,
  ) {
    return this.foldersService.findAll(entityType, parseInt(entityId, 10));
  }

  @Get('tree')
  async getTree(
    @Query('entityType') entityType: 'student' | 'teacher',
    @Query('entityId') entityId: string,
  ) {
    return this.foldersService.findByEntity(entityType, parseInt(entityId, 10));
  }

  @Put(':id')
  async rename(
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    return this.foldersService.rename(parseInt(id, 10), body.name);
  }

  @Post(':id/move')
  async move(
    @Param('id') id: string,
    @Body() body: { parentId: number | null },
  ) {
    return this.foldersService.move(parseInt(id, 10), body.parentId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.foldersService.remove(parseInt(id, 10));
    return { success: true };
  }
}
