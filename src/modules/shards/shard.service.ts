import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShardDto } from './dto/claim-shard.dto';
import { ClaimShardDto } from './dto/create-shard.dto';


@Injectable()
export class ShardService {
  constructor(private readonly prisma: PrismaService) {}

  // Cria um novo shard
  async create(createShardDto: CreateShardDto) {
    return this.prisma.cardShard.create({
      data: {
        cardName: createShardDto.cardName,
        cardPhoto: createShardDto.cardPhoto,
      },
    });
  }

  async getAllShards() {
    return this.prisma.cardShard.findMany({
      include: {
        collectors: true,
        waitingList: true
      }
    });
  }

  async applyForShard(shardId: number, accountId: number) {
    if (!accountId || isNaN(accountId)) {
      throw new Error('ID da account inválido.');
    }
  
    // Verifica se a conta já está coletando ou na fila de outra carta
    const existingEntry = await this.prisma.cardShard.findFirst({
      where: {
        OR: [
          { collectors: { some: { id: accountId } } }, 
          { waitingList: { some: { id: accountId } } }
        ]
      }
    });
  
    if (existingEntry) {
      throw new BadRequestException('Você já está coletando uma carta. Não pode entrar na fila de outra.');
    }
  
    const shard = await this.prisma.cardShard.findUnique({
      where: { id: shardId },
      include: { collectors: true, waitingList: true }
    });
  
    if (!shard) throw new NotFoundException('Shard não encontrado.');
  
    // Se houver menos de 2 jogadores coletando, adiciona diretamente na coleta
    if (shard.collectors.length < 2) {
      return this.prisma.cardShard.update({
        where: { id: shard.id },
        data: {
          collectors: {
            connect: { id: accountId }
          }
        }
      });
    }
  
    // Se já houver 2 jogadores, adiciona na fila de espera
    return this.prisma.cardShard.update({
      where: { id: shard.id },
      data: {
        waitingList: { connect: { id: accountId } }
      }
    });
  }
  
}