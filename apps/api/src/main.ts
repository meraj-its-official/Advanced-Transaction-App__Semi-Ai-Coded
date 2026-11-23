import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth.config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Better Auth handler (express.json se pehle mount karna zaroori hai)
  app.use('/api/auth', toNodeHandler(auth));

  // Baaki sabhi NestJS routes ke liye JSON & URL-encoded body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Keep the configured port consistent in the startup log.
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`PayTM API Gateway running on http://localhost:${port}`);
}
bootstrap();
