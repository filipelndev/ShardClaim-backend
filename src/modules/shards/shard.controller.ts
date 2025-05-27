import { Controller, Body, Get, Post, Patch, Param, BadRequestException, Res } from '@nestjs/common';
import { ShardService } from './shard.service';
import { CreateShardDto } from './dto/claim-shard.dto';
import { Response } from 'express';
import { ClaimShardDto } from './dto/create-shard.dto';


@Controller('shards')
export class ShardController {
  constructor(private readonly shardService: ShardService) {}

  // Cria um novo shard (endpoint para administradores, por exemplo)
  @Post()
  create(@Body() createShardDto: CreateShardDto) {
    return this.shardService.create(createShardDto);
  }

  @Get()
  async getAllShards() {
    return this.shardService.getAllShards();
  }

  @Post(':id/apply')
async applyForShard(
  @Param('id') shardId: number,
  @Body('accountId') accountId: number
) {
  if (!accountId) {
    throw new BadRequestException('O ID da account não foi enviado.');
  }
  return this.shardService.applyForShard(+shardId, +accountId);
}

@Post('removeFromQueue/:shardId')
  async removeFromQueue(
    @Param('shardId') shardId: number,
    @Body('accountId') accountId: number,
    @Res() res: Response
  ) {
    if (!accountId) {
      return res
        .status(400)
        .json({ message: 'O ID da account não foi enviado.' });
    }
    try {
      await this.shardService.removeFromQueue(+shardId, +accountId);
      return res
        .status(200)
        .json({ message: 'Conta removida e fila reorganizada com sucesso!' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Post('adminRemove/:shardId')
async adminRemoveFromShard(
  @Param('shardId') shardId: number,
  @Body('accountId') accountId: number,
  @Res() res: Response
) {
  if (!accountId) {
    return res.status(400).json({ message: 'O ID da account não foi enviado.' });
  }
  try {
    await this.shardService.adminRemoveFromShard(+shardId, +accountId);
    return res.status(200).json({ message: 'Conta removida pelo administrador e fila reorganizada!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

@Post('promote/:shardId')
async promotePlayer(
  @Param('shardId') shardId: number,
  @Body('accountId') accountId: number,
  @Res() res: Response
) {
  if (!accountId) {
    return res.status(400).json({ message: 'O ID da account não foi enviado.' });
  }
  try {
    await this.shardService.promotePlayer(+shardId, +accountId);
    return res.status(200).json({ message: 'Jogador promovido para a coleta com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

@Post('addToQueue/:shardId')
async addToQueue(
  @Param('shardId') shardId: number,
  @Body('accountId') accountId: number,
  @Res() res: Response
) {
  if (!accountId) {
    return res.status(400).json({ message: 'O ID da account não foi enviado.' });
  }
  try {
    const result = await this.shardService.addToQueue(+shardId, +accountId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

@Post('finalizeCollection/:shardId')
async finalizeCollection(
  @Param('shardId') shardId: number,
  @Body('accountId') accountId: number, // Adicionando accountId no corpo da requisição
  @Res() res: Response
) {
  try {
    const result = await this.shardService.finalizeCollection(+shardId, +accountId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

}