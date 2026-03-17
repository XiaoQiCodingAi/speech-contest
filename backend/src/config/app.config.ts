export const appConfig = {
  // 默认密码配置
  teacher: {
    defaultPassword: process.env.TEACHER_DEFAULT_PASSWORD || '123123',
  },
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
