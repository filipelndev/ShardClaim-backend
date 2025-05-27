// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma = app.get(PrismaService);
  app.use(express.json({ limit: '5mb' })); // 🔥 Permite arquivos de até 5MB
  app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.enableCors({
  origin: ['*'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

  // Criar usuário admin, se ainda não existir
  const admin = await prisma.user.findUnique({ where: { email: 'admin@gbr.com' } });
  const hashedPassword = await bcrypt.hash('senha123', 10);

  if (!admin) {
    console.log('Criando conta de administrador...');
    await prisma.user.create({
      data: {
        username: 'Administrador',
        email: 'admin@gbr.com',
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
  } else {
    console.log('Conta de administrador já existe.');
  }

  // Popular os shards iniciais automaticamente
  const shards = [
    { cardName: 'Paragon', cardPhoto: 'paragon.jpeg' },
    { cardName: 'Archdeva', cardPhoto: 'archDeva.jpeg'  },
    { cardName: 'Faen Fistborn', cardPhoto: 'faenFistborn.jpeg' },
    { cardName: 'Abaddon', cardPhoto: 'abaddon.jpeg' },
    { cardName: 'Angel Prime', cardPhoto: 'angelPrime.jpeg' },
  ];

  for (const shard of shards) {
    await prisma.cardShard.upsert({
      where: { cardName: shard.cardName },
      update: {},
      create: shard,
    });
  }

  console.log('Shards populados com sucesso!');

  await app.listen(3000);
}
bootstrap();
