import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    entityType: string,
    userId: number,
    ip: string,
    entityId?: number,
    oldValue?: Record<string, any>,
    newValue?: Record<string, any>,
    description?: string,
  ): Promise<AuditLog> {
    const log = this.auditLogsRepository.create({
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      description,
      ip,
      userId,
    });

    return this.auditLogsRepository.save(log);
  }

  async findAll(
    page = 1,
    pageSize = 20,
    userId?: number,
    action?: AuditAction,
    entityType?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogsRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    if (entityType) {
      queryBuilder.andWhere('log.entityType = :entityType', { entityType });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('log.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<AuditLog | null> {
    return this.auditLogsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async getUserRecentActions(userId: number, limit = 10): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
