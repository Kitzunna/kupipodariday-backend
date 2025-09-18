import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Валидация DTO по всему приложению
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // выбрасываем поля, которых нет в DTO
      forbidNonWhitelisted: true, // ругаемся, если прислали лишние поля
      transform: true,            // авто-преобразование типов из строк (query/body)
    }),
  );

  // Разрешим запросы с фронтенда (другой порт/хост)
  app.enableCors();

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`API is running on http://localhost:${port}`);
}
bootstrap();
