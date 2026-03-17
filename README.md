# 学校档案管理系统

一个基于 React + NestJS + PostgreSQL + Redis 的学校档案管理系统。

## 项目结构

```
school-archive/
├── frontend/          # 前端项目 (React + Vite + TypeScript + Ant Design)
├── backend/           # 后端项目 (NestJS + TypeScript)
└── docker-compose.yml # Docker Compose 配置文件
```

## 技术栈

### 前端
- React 18
- TypeScript
- Ant Design
- Vite
- React Router
- Axios

### 后端
- Node.js
- NestJS
- TypeScript
- JWT 认证
- TypeORM (PostgreSQL)
- Redis

### 数据库
- PostgreSQL 15
- Redis 7

## 快速开始

### 1. 启动数据库服务

```bash
docker-compose up -d
```

### 2. 启动后端服务

```bash
cd backend
npm install
npm run start:dev
```

后端服务将在 http://localhost:3000 运行

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:8080 运行

## 端口配置

- 前端开发服务器：8080
- 后端 API：3000
- PostgreSQL：5432
- Redis：6379

## 测试账号

- 管理员：admin / admin123
- 教师：teacher / teacher123

## 功能特性

### 当前版本 (v0.1.0 - 最小可运行版本)

- ✅ 用户登录功能
- ✅ JWT 认证
- ✅ 基础布局
- ✅ Docker Compose 配置

### 计划功能

- 📋 档案管理（增删改查）
- 📋 用户管理
- 📋 权限管理
- 📋 文件上传下载
- 📋 数据统计与报表

## 开发说明

### 前端开发

```bash
cd frontend
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
```

### 后端开发

```bash
cd backend
npm run start:dev  # 启动开发模式（热重载）
npm run start      # 启动生产模式
npm run build      # 构建
npm run test       # 运行测试
```

## 数据库配置

数据库连接信息（在 docker-compose.yml 中配置）：

- PostgreSQL
  - Host: localhost
  - Port: 5432
  - Database: school_archive
  - Username: school_archive
  - Password: school_archive_password

- Redis
  - Host: localhost
  - Port: 6379

## 注意事项

1. 生产环境请修改 JWT 密钥（在 backend/src/auth/auth.module.ts 中）
2. 生产环境请使用环境变量管理敏感配置
3. 当前版本使用硬编码的用户数据，后续会连接真实数据库

## License

MIT
