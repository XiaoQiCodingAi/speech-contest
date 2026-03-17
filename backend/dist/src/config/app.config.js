"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
exports.appConfig = {
    teacher: {
        defaultPassword: process.env.TEACHER_DEFAULT_PASSWORD || '123123',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
};
//# sourceMappingURL=app.config.js.map