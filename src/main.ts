// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma = app.get(PrismaService);

  app.enableCors({
    origin: 'http://localhost:4200', // Permite requisições do frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  });

  app.enableCors({
    origin: '*',
    methods: ['GET'],
    allowedHeaders: ['Content-Type']
  });

  // Verifica se já existe um administrador
  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  const hashedPassword = await bcrypt.hash('senha123', 10);

  if (!admin) {
    console.log('Criando conta de administrador...');
    await prisma.user.create({
      data: {
        username: 'Administrador',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
  } else {
    console.log('Conta de administrador já existe.');
  }

  await app.listen(3000);
}
bootstrap();
