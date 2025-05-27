import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShardDto } from './dto/claim-shard.dto';

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

  async removeFromQueue(shardId: number, accountId: number): Promise<{ message: string }> {
  const shard = await this.prisma.cardShard.findUnique({
    where: { id: shardId },
    include: { collectors: true, waitingList: true },
  });

  if (!shard) throw new NotFoundException('Shard não encontrado.');

  const isCollector = shard.collectors.some(acc => acc.id === accountId);
  const isInQueue = shard.waitingList.some(acc => acc.id === accountId);

  if (!isCollector && !isInQueue) {
    throw new BadRequestException('A conta não está na fila nem coletando esse shard.');
  }

  // Se a conta está coletando, desconecta e promove o próximo da fila, se houver
  if (isCollector) {
    await this.prisma.cardShard.update({
      where: { id: shardId },
      data: {
        collectors: {
          disconnect: { id: accountId },
        },
      },
    });

    if (shard.waitingList.length > 0) {
      const nextInLine = shard.waitingList[0];
      await this.prisma.cardShard.update({
        where: { id: shardId },
        data: {
          collectors: {
            connect: { id: nextInLine.id },
          },
          waitingList: {
            disconnect: { id: nextInLine.id },
          },
        },
      });
    }
  }

  // Se a conta está apenas na fila (e não coletando), usa disconnect para removê-la
  if (!isCollector && isInQueue) {
    await this.prisma.cardShard.update({
      where: { id: shardId },
      data: {
        waitingList: {
          disconnect: { id: accountId },
        },
      },
    });
  }

  return { message: 'Conta removida e fila reorganizada com sucesso!' };
}


async adminRemoveFromShard(shardId: number, accountId: number): Promise<{ message: string }> {
  const shard = await this.prisma.cardShard.findUnique({
    where: { id: shardId },
    include: { collectors: true, waitingList: true },
  });

  if (!shard) throw new NotFoundException('Shard não encontrado.');

  const isCollector = shard.collectors.some(acc => acc.id === accountId);
  const isInQueue = shard.waitingList.some(acc => acc.id === accountId);

  if (!isCollector && !isInQueue) {
    throw new BadRequestException('A conta não está na fila nem coletando esse shard.');
  }

  // Se o admin remover um coletor, promove o próximo da fila automaticamente
  if (isCollector) {
    await this.prisma.cardShard.update({
      where: { id: shardId },
      data: {
        collectors: {
          disconnect: { id: accountId },
        },
      },
    });

    if (shard.waitingList.length > 0) {
      const nextInLine = shard.waitingList[0];
      await this.prisma.cardShard.update({
        where: { id: shardId },
        data: {
          collectors: {
            connect: { id: nextInLine.id },
          },
          waitingList: {
            disconnect: { id: nextInLine.id },
          },
        },
      });
    }
  }

  // Se o admin remover da fila, simplesmente desconectamos a conta
  if (isInQueue) {
    await this.prisma.cardShard.update({
      where: { id: shardId },
      data: {
        waitingList: {
          disconnect: { id: accountId },
        },
      },
    });
  }

  return { message: 'Conta removida pelo administrador e fila reorganizada!' };
}

async promotePlayer(shardId: number, accountId: number): Promise<{ message: string }> {
  const shard = await this.prisma.cardShard.findUnique({
    where: { id: shardId },
    include: { collectors: true, waitingList: true },
  });

  if (!shard) throw new NotFoundException('Shard não encontrado.');

  // Verifica se a conta está na fila
  const isInQueue = shard.waitingList.some(acc => acc.id === accountId);
  if (!isInQueue) throw new BadRequestException('A conta não está na fila desse shard.');

  // Verifica se há espaço disponível na coleta
  if (shard.collectors.length >= 2) {
    throw new BadRequestException('Já existem 2 jogadores coletando. Não é possível promover mais um.');
  }

  // Remove o jogador da fila e adiciona como coletor
  await this.prisma.cardShard.update({
    where: { id: shardId },
    data: {
      collectors: {
        connect: { id: accountId },
      },
      waitingList: {
        disconnect: { id: accountId },
      },
    },
  });

  return { message: 'Jogador promovido para a coleta com sucesso!' };
}

async addToQueue(shardId: number, accountId: number): Promise<{ message: string }> {
  const shard = await this.prisma.cardShard.findUnique({
    where: { id: shardId },
    include: { collectors: true, waitingList: true },
  });

  if (!shard) throw new NotFoundException('Shard não encontrado.');

  // Verifica se o jogador já está coletando ou na fila
  const isCollector = shard.collectors.some(acc => acc.id === accountId);
  const isInQueue = shard.waitingList.some(acc => acc.id === accountId);
  if (isCollector || isInQueue) {
    throw new BadRequestException('Essa conta já está coletando ou na fila.');
  }

  // Se não houver coletores, adiciona direto na coleta
  if (shard.collectors.length < 2) {
    await this.prisma.cardShard.update({
      where: { id: shardId },
      data: {
        collectors: {
          connect: { id: accountId },
        },
      },
    });

    return { message: 'Conta adicionada diretamente à coleta!' };
  }

  // Se já houver coletores, adiciona no final da fila
  await this.prisma.cardShard.update({
    where: { id: shardId },
    data: {
      waitingList: {
        connect: { id: accountId },
      },
    },
  });

  return { message: 'Conta adicionada à fila de espera!' };
}

async finalizeCollection(shardId: number, accountId: number): Promise<{ message: string }> {
  const shard = await this.prisma.cardShard.findUnique({
    where: { id: shardId },
    include: { collectors: true, waitingList: true },
  });

  if (!shard || !shard.collectors.some(c => c.id === accountId)) {
    throw new BadRequestException('Conta não encontrada na coleta.');
  }

  // Remove a conta escolhida da lista de coletores
  await this.prisma.cardShard.update({
    where: { id: shardId },
    data: {
      collectors: {
        disconnect: { id: accountId },
      },
    },
  });

  // Se houver alguém na fila, promover automaticamente a primeira conta
  if (shard.waitingList.length > 0) {
    const nextInQueue = shard.waitingList[0];

    await this.prisma.cardShard.update({
      where: { id: shardId },
      data: {
        collectors: {
          connect: { id: nextInQueue.id }, // Move a conta da fila para coleta
        },
        waitingList: {
          disconnect: { id: nextInQueue.id }, // Remove da fila
        },
      },
    });
  }

  return { message: 'Coletor removido e próxima conta da fila promovida!' };
}
}