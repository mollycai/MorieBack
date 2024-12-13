import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';

const SERVER_PORT = process.env.SERVER_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  await app.listen(SERVER_PORT, '0.0.0.0');
}
bootstrap();
