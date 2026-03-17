import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class AuthService {
  // 简单的 token 黑名单（生产环境应使用 Redis）
  private tokenBlacklist: Set<string> = new Set();

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(username: string, password: string, ip: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      name: user.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone,
        email: user.email,
      },
    };
  }

  async logout(token: string) {
    // 将 token 加入黑名单
    if (token) {
      this.tokenBlacklist.add(token);
      // 清理过期的 token（简单实现，生产环境应使用 Redis 并设置过期时间）
      this.cleanupExpiredTokens();
    }
    return { success: true, message: '登出成功' };
  }

  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  private cleanupExpiredTokens() {
    // 简单实现：定期清理（生产环境应使用 Redis TTL）
    if (this.tokenBlacklist.size > 10000) {
      this.tokenBlacklist.clear();
    }
  }

  async register(username: string, password: string, name: string, role?: UserRole) {
    // 检查用户名是否已存在
    const existingUser = await this.usersRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      name,
      role: role || UserRole.TEACHER,
      isActive: true,
    });

    await this.usersRepository.save(user);

    return {
      success: true,
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const { password, ...result } = user;
    return result;
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    // 验证新密码强度（至少6位）
    if (newPassword.length < 6) {
      throw new UnauthorizedException('新密码长度至少为6位');
    }

    // 加密并更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(userId, { password: hashedPassword });

    return {
      success: true,
      message: '密码修改成功',
    };
  }
}
