import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as crypto from 'crypto';
(globalThis as any).crypto = crypto;

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log('Server is running on port', process.env.PORT ?? 3000);
};

bootstrap();
