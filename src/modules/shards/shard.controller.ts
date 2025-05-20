import { Controller, Body, Get, Post, Patch, Param, BadRequestException } from '@nestjs/common';
import { ShardService } from './shard.service';
import { CreateShardDto } from './dto/claim-shard.dto';
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

@Post('finish/:shardId')
  async finishShard(
    @Param('shardId') shardId: number,
    @Body() body: { collectorIndex: number }
  ) {
    return this.shardService.finishShard(shardId, body.collectorIndex);
  }
}