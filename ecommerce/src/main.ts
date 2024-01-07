import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    exposedHeaders: ['x-forwarded-for'],
  });

  await app.listen(process.env.PORT);
}
bootstrap();
