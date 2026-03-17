import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Folder } from '../entities/folder.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    name: string,
    entityType: 'student' | 'teacher',
    entityId: number,
    userId: number,
    parentId?: number,
  ): Promise<Folder> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const folder = this.folderRepository.create({
      name,
      entityType,
      entityId,
      createdBy: userId,
      parentId,
    });

    return this.folderRepository.save(folder);
  }

  async findByEntity(entityType: 'student' | 'teacher', entityId: number): Promise<Folder[]> {
    return this.folderRepository.find({
      where: { entityType, entityId, parentId: IsNull() },
      relations: ['children'],
      order: { createdAt: 'ASC' },
    });
  }

  async findAll(entityType: 'student' | 'teacher', entityId: number): Promise<Folder[]> {
    return this.folderRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'ASC' },
    });
  }

  async rename(id: number, name: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException('文件夹不存在');
    }
    folder.name = name;
    return this.folderRepository.save(folder);
  }

  async move(id: number, parentId: number | null): Promise<Folder> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException('文件夹不存在');
    }
    // 不能移动到自己或自己的子文件夹
    if (parentId === id) {
      throw new Error('不能移动到自身');
    }
    (folder as any).parentId = parentId;
    return this.folderRepository.save(folder);
  }

  async remove(id: number): Promise<void> {
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!folder) {
      throw new NotFoundException('文件夹不存在');
    }

    // 递归删除子文件夹
    if (folder.children && folder.children.length > 0) {
      for (const child of folder.children) {
        await this.remove(child.id);
      }
    }

    await this.folderRepository.remove(folder);
  }
}
