"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const path = __importStar(require("path"));
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'school_archive',
    password: process.env.DB_PASSWORD || 'school_archive_password',
    database: process.env.DB_DATABASE || 'school_archive',
    entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    synchronize: true,
});
async function initDatabase() {
    await AppDataSource.initialize();
    console.log('数据库连接成功');
    const userRepository = AppDataSource.getRepository('User');
    const existingAdmin = await userRepository.findOne({
        where: { username: 'admin' },
    });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await userRepository.save({
            username: 'admin',
            password: hashedPassword,
            name: '系统管理员',
            role: 'admin',
            isActive: true,
        });
        console.log('创建默认管理员账号: admin / admin123');
    }
    const existingLeader = await userRepository.findOne({
        where: { username: 'leader' },
    });
    if (!existingLeader) {
        const hashedPassword = await bcrypt.hash('leader123', 10);
        await userRepository.save({
            username: 'leader',
            password: hashedPassword,
            name: '张领导',
            role: 'leader',
            isActive: true,
        });
        console.log('创建测试领导账号: leader / leader123');
    }
    const existingTeacher = await userRepository.findOne({
        where: { username: 'teacher' },
    });
    if (!existingTeacher) {
        const hashedPassword = await bcrypt.hash('teacher123', 10);
        await userRepository.save({
            username: 'teacher',
            password: hashedPassword,
            name: '李老师',
            role: 'teacher',
            isActive: true,
        });
        console.log('创建测试教师账号: teacher / teacher123');
    }
    const classRepository = AppDataSource.getRepository('Class');
    const existingClasses = await classRepository.count();
    if (existingClasses === 0) {
        const classes = [
            { name: '一年级1班', grade: '一年级', year: 2024 },
            { name: '一年级2班', grade: '一年级', year: 2024 },
            { name: '二年级1班', grade: '二年级', year: 2024 },
            { name: '二年级2班', grade: '二年级', year: 2024 },
            { name: '三年级1班', grade: '三年级', year: 2024 },
        ];
        await classRepository.save(classes);
        console.log('创建测试班级数据');
    }
    console.log('数据库初始化完成');
    await AppDataSource.destroy();
}
initDatabase().catch((error) => {
    console.error('数据库初始化失败:', error);
    process.exit(1);
});
//# sourceMappingURL=init.js.map