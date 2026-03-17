import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS（允许所有来源）
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 使用全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();
