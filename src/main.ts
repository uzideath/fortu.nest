import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './lib/responses';
import { AllExceptionsFilter } from './lib/filters';
import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<INestApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const logger = new Logger('Bootstrap');
  const port = configService.get<number>('PORT') ?? 3000;
  const apiVersion = configService.get<string>('API_VERSION') ?? 'v1';
  const frontendUrl = configService.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
  const reflector = app.get(Reflector);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix(`api/${apiVersion}`);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`Server running on port ${port}`);
}

bootstrap();
