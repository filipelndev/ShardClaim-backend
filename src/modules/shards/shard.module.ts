// src/shards/shard.module.ts
import { Module } from '@nestjs/common';
import { ShardService } from './shard.service';
import { ShardController } from './shard.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ShardController],
  providers: [ShardService, PrismaService],
})
export class ShardModule {}
