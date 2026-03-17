import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { TeacherScopeGuard } from './teacher-scope.guard';
import { User } from '../entities/user.entity';
import { TeacherPermission } from '../entities/teacher-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TeacherPermission]),
    PassportModule,
    JwtModule.register({
      secret: 'school-archive-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard, TeacherScopeGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, TeacherScopeGuard],
})
export class AuthModule {}
